import { Hono, type Context } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { getPostgrestUrl, validateAllEnvVariables } from "./helper";
import { HTTPException } from "hono/http-exception";
import {
  GET as collectionsGET,
  POST as collectionsPOST,
} from "./routes/collections/[name]";
import {
  GET as collectionsWithIdGET,
  PUT as collectionsWithIdPUT,
  DELETE as collectionsWithIdDELETE,
} from "./routes/collections/[name]/[id]";
import {
  GET as filesGET,
  DELETE as filesDELETE,
} from "./routes/files/[bucket]/[id]";
import { POST as filesPOST } from "./routes/files/[bucket]";
import jwtlib from "jsonwebtoken";
import { getDb } from "./lib/db/db-connection";
import {
  inputs,
  projects,
  reports,
  sites,
  userProjects,
  users,
} from "./lib/db/db-schema";
import { and, eq, inArray } from "drizzle-orm";

/**
 * validate .ENV variables
 */
validateAllEnvVariables();

type HonoContextVariables = {
  usersId: string;
  usersEmail: string;
};

const app = new Hono<{ Variables: HonoContextVariables }>();
app.use(logger());

/**
 * Server configuration
 */
const PORTSTR = process.env.PORT!;
const PORT = parseInt(PORTSTR);

/**
 * CORS configuration
 */
const originsFromEnv = process.env.ALLOWED_ORIGINS;
const ALLOWED_ORIGINS = originsFromEnv ? originsFromEnv.split(",") : [];
console.log("Allowed origins:", ALLOWED_ORIGINS);

/**
 * Middleware for CORS
 */
app.use(
  "/*",
  cors({
    origin: ALLOWED_ORIGINS,
  })
);

/**
 * Middleware for external JWT authentication
 */
const jwtPublicKey = process.env.JWT_PUBLIC_KEY || "";
// Hono can´t handle Auth0 JWT tokens
// https://github.com/honojs/hono/issues/672
app.use("/v1/*", async (c, next) => {
  try {
    const bearer = (c.req.header("Authorization") || "").split(" ")[1];
    jwtlib.verify(bearer, jwtPublicKey, {
      algorithms: ["RS256"],
    });
    const jwt = jwtlib.decode(bearer);
    if (jwt && typeof jwt === "object") {
      c.set("usersEmail", jwt.email ?? "");
      c.set("usersId", jwt.sub ?? "");
    } else {
      return c.text("Wrong JWT Content", 401);
    }
  } catch (err) {
    return c.text("Unauthorized", 401);
  }
  await next();
});

/*
--------------------------
An endpoint build directly on the ORM to have a CRUD API for all tables
--------------------------
*/

/**
 * A Ping endpoint
 */
app.get("/ping", async (c) => {
  return c.json({
    online: true,
  });
});

/**
 * Get the own user
 */
app.get("/v1/user/me", async (c: Context) => {
  // check if id is set
  const id = c.get("usersId");
  const user = await getDb().select().from(users).where(eq(users.id, id));

  if (!user || user.length === 0) {
    throw new HTTPException(404, { message: "User not found" });
  } else {
    return c.json(user[0]);
  }
});

/**
 * Update some users data
 */
app.put("/v1/user/me", async (c: Context) => {
  // check if id is set
  const id = c.get("usersId");
  const body = await c.req.json();
  const user = await getDb().select().from(users).where(eq(users.id, id));
  if (!user || user.length === 0) {
    throw new HTTPException(404, { message: "User not found" });
  }

  const updated = await getDb()
    .update(users)
    .set({
      lastSelectedProject: body.lastSelectedProject ?? undefined,
      lastSelectedSite: body.lastSelectedSite ?? undefined,
      lastSelectedReport: body.lastSelectedReport ?? undefined,
    });

  return c.json(updated);
});

/**
 * Collections endpoint
 */
app.all("/v1/db/collections/:name/:id?", async (c: Context) => {
  // check if id is set
  const id = c.req.param("id");
  if (!id) {
    if (c.req.method === "GET") {
      return collectionsGET(c);
    } else if (c.req.method === "POST") {
      return collectionsPOST(c);
    } else {
      throw new HTTPException(405, { message: "Method not allowed" });
    }
  } else {
    if (c.req.method === "GET") {
      return collectionsWithIdGET(c);
    } else if (c.req.method === "PUT") {
      return collectionsWithIdPUT(c);
    } else if (c.req.method === "DELETE") {
      return collectionsWithIdDELETE(c);
    } else {
      throw new HTTPException(405, { message: "Method not allowed" });
    }
  }
});

/**
 * Collections endpoint
 */
app.all("/v1/db/files/:bucket/:id?", async (c: Context) => {
  // check if id is set
  const id = c.req.param("id");
  if (!id) {
    if (c.req.method === "POST") {
      return filesPOST(c);
    } else {
      throw new HTTPException(405, { message: "Method not allowed" });
    }
  } else {
    if (c.req.method === "GET") {
      return filesGET(c);
    } else if (c.req.method === "DELETE") {
      return filesDELETE(c);
    } else {
      throw new HTTPException(405, { message: "Method not allowed" });
    }
  }
});

/**
 * Create a user in the DB if it does not exist
 */
app.get("/v1/db/hooks/ensure-user", async (c: Context) => {
  await getDb()
    .insert(users)
    .values({
      id: c.get("usersId"),
      email: c.get("usersEmail"),
    })
    .onConflictDoUpdate({
      target: users.id,
      set: {
        email: c.get("usersEmail"),
      },
    })
    .execute();
  return c.json({ message: "ok" });
});

/**
 * Create a new project
 */
app.post("/v1/db/hooks/create-project", async (c: Context) => {
  // HACK: check if user is allowed to create a project
  try {
    // add project
    const project = await c.req.json();
    const created = await getDb().insert(projects).values(project).returning();
    // add the user to the project
    await getDb()
      .insert(userProjects)
      .values({
        userId: c.get("usersId"),
        projectId: created[0].id,
      });

    return c.json(created[0]);
  } catch (err) {
    throw new HTTPException(400, { message: err + "" });
  }
});

/**
 * Create a new project
 */
app.get("/v1/db/inputs-for-project", async (c: Context) => {
  try {
    const project = c.req.query("project");
    const yearsList = c.req.query("years");
    const extend =
      c.req.query("extend") && c.req.query("extend") === "true" ? true : false;

    const years: number[] =
      yearsList && yearsList.length > 0
        ? yearsList.split(",").map((y: string) => parseInt(y))
        : [];

    if (!project) {
      throw new HTTPException(400, { message: "project is required" });
    }

    // create an dict from all keys in "inputs" with value=true
    const cols: { [col: string]: boolean } = {};
    for (const col of Object.keys(inputs)) {
      cols[col] = true;
    }

    // extended result
    if (extend) {
      const userInputs = await getDb().query.inputs.findMany({
        with: {
          report: {
            where: years.length > 0 ? inArray(reports.year, years) : undefined,
            with: {
              site: {
                project: {
                  where: eq(projects.id, project),
                },
              },
            },
          },
          facility: true,
        },
      });

      return c.json(userInputs);
    }
    // simple result
    else {
      const userInputs = await getDb()
        .select()
        .from(inputs)
        .where(
          eq(
            inputs.report,
            getDb()
              .select({
                reportId: reports.id,
              })
              .from(reports)
              .innerJoin(sites, eq(reports.site, sites.id))
              .where(
                years.length > 0
                  ? eq(sites.project, project)
                  : and(
                      eq(sites.project, project),
                      inArray(reports.year, years)
                    )
              )
              .limit(1)
          )
        );

      return c.json(userInputs);
    }
  } catch (err) {
    throw new HTTPException(400, { message: err + "" });
  }
});

/**
 * PROXY for PostgREST
 */
app.all("/v1/db/postgrest/*", async (c: Context) => {
  const url = getPostgrestUrl(c.req.url);
  const body = await c.req.text();
  const headers = new Headers(c.req.raw.headers);
  headers.delete("host");

  const res = await fetch(url, {
    method: c.req.method,
    headers,
    body: body.length > 0 ? body : undefined,
  });

  // No-Content response
  if (res.status === 204) {
    return new Response(null, res);
  }
  // All other responses
  else {
    const newResponse = new Response(res.body, res);
    return newResponse;
  }
});

/*
--------------------------
Server
--------------------------
*/
export default {
  port: PORT,
  fetch: app.fetch,
};

console.log(`Server is running on port http://localhost:${PORT}`);

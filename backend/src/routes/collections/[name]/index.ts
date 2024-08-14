import {
  getOrderBy,
  mapConditionsToDrizzleWhereObject,
  parseSearchParams,
} from "./url-parser";
import {
  getPermissionDefinionForMethod,
  permissionCheckerViaBody,
  permissionCheckerViaUrlParams,
} from "./permission-check";
import {
  getDbSchemaTable,
  normalizeTableName,
} from "../../../lib/db/db-get-schema";
import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { getDb } from "../../../lib/db/db-connection";

/**
 * GET Route for the collections endpoint
 * will return a list of objects from the ORM by table name
 * can be filtered by URL query parameters
 */
export const GET = async (c: Context) => {
  try {
    const userId = "";
    const tableNameRaw = c.req.param("name");

    // check table-name and get schema
    const tableName = normalizeTableName(tableNameRaw ?? "");

    // parse URL query parameters and map to ORM query
    const searchParams = new URLSearchParams(c.req.url.split("?")[1] || "");
    const parsedParams = parseSearchParams(searchParams);

    const orderBy = searchParams.get("orderBy") ?? undefined;
    const orderAsc =
      searchParams.get("order") && searchParams.get("order") === "asc"
        ? true
        : false;
    const limit = searchParams.get("limit") ?? undefined;
    const single = searchParams.get("single") === "true" ? true : false;
    const columns = searchParams.get("columns")?.split(",") ?? undefined;

    // check for some hidden tables
    // check permissions on the ressource for GET
    const definition = getPermissionDefinionForMethod(tableName, "GET");
    await permissionCheckerViaUrlParams(definition, userId, parsedParams);

    // start query
    const table = getDbSchemaTable(tableName);
    const where = mapConditionsToDrizzleWhereObject(table, parsedParams);
    if (!where) {
      
      const data = await getDb().select().from(table);
      console.log("no where", tableName);
      // @ts-ignore
      // const data2 = await getDb().query[table].findMany({
      //   orderBy: orderBy ? getOrderBy(orderBy, table, orderAsc) : undefined,
      //   limit: limit ? parseInt(limit) : undefined,
      // });

      if (single && Array.isArray(data)) {
        if (data.length === 0) {
          return c.json({});
        }
        return c.json(data[0]);
      } else {
        return c.json(data);
      }
    } else {
      // @ts-ignore
      const data = await getDb().query[tableName].findMany({
        where,
        orderBy: orderBy ? getOrderBy(orderBy, table, orderAsc) : undefined,
        limit: limit ? parseInt(limit) : undefined,
      });

      if (single && Array.isArray(data)) {
        if (data.length === 0) {
          return c.json({});
        }
        return c.json(data[0]);
      } else {
        return c.json(data);
      }
    }
  } catch (err) {
    throw new HTTPException(400, { message: err + "" });
  }
};

/**
 * POST Route for the collections endpoint
 * will create a new object in the ORM by table name
 */
export const POST = async (c: Context) => {
  try {
    const userId = "";

    let body = await c.req.json();
    const tableNameRaw = c.req.param("name");

    // check table-name and get schema
    const tableName = normalizeTableName(tableNameRaw ?? "");

    // check for some hidden tables
    // check permissions on the ressource for GET
    const definition = getPermissionDefinionForMethod(tableName, "POST");
    await permissionCheckerViaBody(definition, userId, body);

    // pre-actions necessary?
    if (definition.preAction) {
      body = await definition.preAction(userId, body);
    }

    // start query
    const table = getDbSchemaTable(tableName);

    // create new object
    if (definition.inserter) {
      const data = await definition.inserter(userId, body);
      return c.json(data ?? {});
    } else {
      // if there was an id in the body. remove it since it should be auto-generated
      delete body.id;
      // @ts-ignore
      const data = await getDb().insert(table).values(body).returning();
      return c.json(data[0] ?? {});
    }
  } catch (err) {
    throw new HTTPException(400, { message: err + "" });
  }
};

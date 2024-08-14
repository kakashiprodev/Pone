import { Hono, type Context } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { getPostgrestUrl, validateAllEnvVariables } from './helper';
import { HTTPException } from 'hono/http-exception';
import {
  GET as collectionsGET,
  POST as collectionsPOST,
} from './routes/collections/[name]';
import {
  GET as collectionsWithIdGET,
  PUT as collectionsWithIdPUT,
  DELETE as collectionsWithIdDELETE,
} from './routes/collections/[name]/[id]';
import jwtlib from 'jsonwebtoken';

/**
 * validate .ENV variables
 */
validateAllEnvVariables();

type HonoContextVariables = {
  model: any;
  userId: string;
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
const ALLOWED_ORIGINS = originsFromEnv ? originsFromEnv.split(',') : [];
console.log('Allowed origins:', ALLOWED_ORIGINS);

/**
 * Middleware for CORS
 */
app.use(
  '/*',
  cors({
    origin: ALLOWED_ORIGINS,
  }),
);

/**
 * Middleware for external JWT authentication
 */
const jwtPublicKey = process.env.JWT_PUBLIC_KEY || '';
// Hono can´t handle Auth0 JWT tokens
// https://github.com/honojs/hono/issues/672
app.use('/v1/*', async (c, next) => {
  try {
    const bearer = (c.req.header('Authorization') || '').split(' ')[1];
    jwtlib.verify(bearer, jwtPublicKey, {
      algorithms: ['RS256'],
    });
  } catch (err) {
    return c.text('Unauthorized', 401);
  }
  await next();
});

/**
 * A middleware to get the users id from the JWT token
 */
const getUserId = async (
  c: Context,
  next: () => Promise<void>,
): Promise<any> => {
  const id = c.get('jwtPayload')?.sub ?? '';
  c.set('userId', id);
  await next();
};

/*
--------------------------
An endpoint build directly on the ORM to have a CRUD API for all tables
--------------------------
*/

/**
 * A Ping endpoint
 */
app.get('/ping', async (c) => {
  return c.json({
    online: true,
  });
});

/**
 * Collections endpoint
 */
app.all('/v1/db/collections/:name/:id?', async (c: Context) => {
  // check if id is set
  const id = c.req.param('id');
  if (!id) {
    if (c.req.method === 'GET') {
      return collectionsGET(c);
    } else if (c.req.method === 'POST') {
      return collectionsPOST(c);
    } else {
      throw new HTTPException(405, { message: 'Method not allowed' });
    }
  } else {
    if (c.req.method === 'GET') {
      return collectionsWithIdGET(c);
    } else if (c.req.method === 'PUT') {
      return collectionsWithIdPUT(c);
    } else if (c.req.method === 'DELETE') {
      return collectionsWithIdDELETE(c);
    } else {
      throw new HTTPException(405, { message: 'Method not allowed' });
    }
  }
});

/**
 * PROXY for PostgREST
 */
app.all('/v1/db/postgrest/*', async (c: Context) => {
  const url = getPostgrestUrl(c.req.url);
  const body = await c.req.text();
  const headers = new Headers(c.req.raw.headers);
  headers.delete('host');

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

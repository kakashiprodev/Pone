import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { dbSchema } from './db-schema';
import { readFileSync } from 'fs';

const POSTGRES_DB = process.env.POSTGRES_DB ?? '';
const POSTGRES_USER = process.env.POSTGRES_USER ?? '';
const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD ?? '';
const POSTGRES_HOST = process.env.POSTGRES_HOST ?? '';
const POSTGRES_PORT = parseInt(process.env.POSTGRES_PORT ?? '5432');

const caCert = readFileSync('ca.pem').toString();

/**
 * Connect to the database
 */
const createDbClient = async () => {
  /** PG Connection pool */
  const pool = new pg.Pool({
    user: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
    host: POSTGRES_HOST,
    port: POSTGRES_PORT,
    database: POSTGRES_DB,
    max: 3,
    idleTimeoutMillis: 60000,
    ssl: {
      rejectUnauthorized: false,
      ca: caCert,
    },
  });

  pool.on('connect', () => {
    console.log('PG Pool connected to the database');
  });

  pool.on('error', async (err) => {
    console.error('PG Pool Error ', err);
  });

  const client = await pool.connect();

  client.on('error', async (err) => {
    console.error('PG Client error:', err.stack);
    // delete old client
    client.release();
  });

  client.on('end', async () => {
    console.error('PG Client ended the connection.');
    await reconnectToDb();
  });

  client.on('notification', async (msg) => {
    console.log('PG Client notification:', msg);
  });

  client.on('notice', async (msg) => {
    console.log('PG Client notice:', msg);
  });

  // assign the database object to the global variable
  const conn = drizzle(client, { schema: dbSchema, logger: false }); // Initialize Drizzle ORM with the connection pool
  return conn;
};

// hold the connection
let dbClient = await createDbClient();

const reconnectToDb = async () => {
  // @ts-ignore
  dbClient = null;
  dbClient = await createDbClient();
};

/**
 * Re-Connect to the database also on error
 */
if (!dbClient) {
  // this is needed to don´t have a "undefined" db object at the other places where it is used
  console.error(
    'Failed to connect to the database in the first place. Exiting...',
  );
  process.exit(1);
}

export const getDb = () => {
  return dbClient;
};

const db = dbClient;
export type AppDbWithSchema = typeof db;

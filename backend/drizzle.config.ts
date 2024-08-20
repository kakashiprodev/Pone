import { defineConfig } from "drizzle-kit";
import { readFileSync } from "fs";

const POSTGRES_DB = process.env.POSTGRES_DB ?? "";
const POSTGRES_USER = process.env.POSTGRES_USER ?? "";
const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD ?? "";
const POSTGRES_HOST = process.env.POSTGRES_HOST ?? "";
const POSTGRES_PORT = parseInt(process.env.POSTGRES_PORT ?? "5432");

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/lib/db/db-schema.ts",
  out: "./drizzle-sql",
  dbCredentials: {
    user: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
    host: POSTGRES_HOST,
    port: POSTGRES_PORT,
    database: POSTGRES_DB,
    ssl: {
      rejectUnauthorized: false,
      ca: readFileSync("ca.pem").toString(),
    },
    // ssl: false,
  },
});

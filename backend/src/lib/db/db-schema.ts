/**
 * Schema definition for the database.
 */

import * as mainTables from './schema/main';

// export all tables
export * from './schema/main';

export const dbSchema = {
  ...mainTables,
};

/**
 * Export the database schema and the valid table names.
 */
export type DatabaseSchema = typeof dbSchema;
export const validTableNames = Object.keys(dbSchema);

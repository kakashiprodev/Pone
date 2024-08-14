import type { CrudPermission } from '../types/permissions';
import { getDb } from './db-connection';
import { dbSchema, validTableNames, type DatabaseSchema } from './db-schema';

/**
 * check if a table name is valid and return it
 */
export function getDbSchemaTable<K extends keyof DatabaseSchema>(
  tableName: K,
): DatabaseSchema[K] {
  if (!Object.keys(getDb().query).includes(tableName)) {
    throw new Error(`Invalid table name: ${name}`);
  } else {
    const db = getDb();
    const key = tableName as keyof typeof db.query;
    const table = dbSchema[key];
    return table as DatabaseSchema[K];
  }
}

/**
 * Check if a table name is valid
 */
const isValidTablename = (name: string): boolean => {
  return validTableNames.includes(name);
};

/**
 * Returns the table name in a camelCase format
 */
export const normalizeTableName = (name: string): keyof DatabaseSchema => {
  // replace '-'-string to a camelCase string
  const tableName = name.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
  if (!isValidTablename(tableName)) {
    throw new Error(`Invalid table name: ${name}`);
  }
  return tableName as keyof DatabaseSchema;
};

export const checkTablePermissionForUser = async (
  userId: string,
  tableName: keyof DatabaseSchema,
): Promise<CrudPermission> => {
  const p = {
    create: false,
    read: false,
    write: false,
    delete: false,
  };
  if (tableName === 'users') {
    return p;
  } else {
    return p;
  }
};

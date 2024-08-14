import { eq, isNull, or, and, lt, gt, asc, desc } from 'drizzle-orm';
import type { SQL } from 'drizzle-orm';
import type { DatabaseSchema } from '../../../lib/db/db-schema';

type Operator = 'eq' | 'gt' | 'lt' | 'or';

type QueryParamForEquals = {
  operator: 'eq';
  value: string;
};

type QueryParamForOr = {
  operator: 'or';
  value: string[];
};

type QueryParamForLowerThan = {
  operator: 'lt';
  value: string;
};

type QueryParamForGreaterThan = {
  operator: 'gt';
  value: string;
};

export type QueryParams = {
  [key: string]:
    | QueryParamForEquals
    | QueryParamForOr
    | QueryParamForLowerThan
    | QueryParamForGreaterThan;
};

/**
 * Get an string like 'myTable[eq]' and extract column and operator here
 */
function extractColumnOperator(
  inputString: string,
): { column: string; operator: Operator } | null {
  const pattern = /^(.*?)\[(.*?)\]$/;
  const match = inputString.match(pattern);

  if (match) {
    const [, column, operator] = match;
    if (
      operator === 'eq' ||
      operator === 'lt' ||
      operator === 'gt' ||
      operator === 'or'
    )
      return { column, operator };
    else return null;
  } else {
    return null;
  }
}

/**
 * helper to parse the URL query parameters
 */
export function parseSearchParams(searchParams: URLSearchParams): QueryParams {
  const params: QueryParams = {};
  for (const [key, value] of searchParams) {
    const { column, operator } = extractColumnOperator(key) || {
      column: key,
      operator: null,
    };
    // exclude some fixed parameters
    if (
      column === 'order' ||
      column === 'limit' ||
      column === 'orderBy' ||
      column === 'single' ||
      column === 'columns'
    )
      continue;
    if (operator) {
      if (operator === 'or') {
        params[column] = { operator, value: value.split(',') };
      } else {
        params[column] = { operator, value };
      }
    }
  }
  return params;
}

// Assuming DatabaseSchema is defined somewhere as a mapping from table names to table structures
type SingleTable<T extends keyof DatabaseSchema> = DatabaseSchema[T];

/**
 * helper to parse the URL query parameters and map them to ORM query conditions for the where clause
 * HACK: at some points ts is not able to infer the types correctly
 */
export function mapConditionsToDrizzleWhereObject<
  K extends keyof DatabaseSchema,
>(
  table: SingleTable<K>,
  params: QueryParams,
): (SQL | undefined)[] | (SQL | undefined) {
  const conditions: (SQL | undefined)[] = [];
  const conditionsAsString = [];
  for (let [column, { operator, value }] of Object.entries(params)) {
    const columnKey = table[column as keyof typeof table] ?? null;
    if (!columnKey) {
      console.error(`column ${column} not found in table`);
      throw new Error(`column ${column} not found in table`);
    }

    switch (operator) {
      case 'eq':
        // special case for null
        if (value == null || value === 'null') {
          // @ts-ignore
          conditions.push(isNull(columnKey));
          conditionsAsString.push(`isNull(${column})`);
        }
        // else only map the equal condition
        else {
          // @ts-ignore
          conditions.push(eq(columnKey, value));
          conditionsAsString.push(`eq(${column}, ${value})`);
        }
        break;
      case 'or':
        // ensure value is an array
        if (!Array.isArray(value)) value = [value];
        // map each value to a condition
        conditions.push(
          or(
            ...value.map((v) => {
              if (v === 'null') {
                conditionsAsString.push(`isNull(${column})`);
                // @ts-ignore
                return isNull(columnKey);
              } else {
                conditionsAsString.push(`eq(${column}, ${v})`);
                // @ts-ignore
                return eq(columnKey, v);
              }
            }),
          ),
        );
        break;
      case 'lt':
        // @ts-ignore
        conditions.push(lt(columnKey, value));
        conditionsAsString.push(`lt(${column}, ${value})`);
        break;
      case 'gt':
        // @ts-ignore
        conditions.push(gt(columnKey, value));
        conditionsAsString.push(`gt(${column}, ${value})`);
        break;
      default:
        break;
    }
  }
  // console.log('conditionsAsString', conditionsAsString);
  if (conditions.length < 1) {
    return undefined;
  }
  if (conditions.length > 1) {
    return and(...conditions);
  }
  return conditions[0];
}

/**
 * Get "orderBy" in Drizzle format
 */
export const getOrderBy = (
  orderBy: string,
  table: any,
  ascending = true,
): SQL<unknown>[] => {
  const columnKey = table[orderBy as keyof typeof table] ?? null;
  if (!columnKey) {
    console.error(`column ${orderBy} not found in table`);
    throw new Error(`column ${orderBy} not found in table`);
  }
  if (ascending) return [asc(columnKey)];
  else return [desc(columnKey)];
};

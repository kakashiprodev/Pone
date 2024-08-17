import type { CrudPermission } from "./permissions";

type Operator = "eq" | "gt" | "lt" | "or";

type QueryParamForEquals = {
  operator: "eq";
  value: string;
};

type QueryParamForOr = {
  operator: "or";
  value: string[];
};

type QueryParamForLowerThan = {
  operator: "lt";
  value: string;
};

type QueryParamForGreaterThan = {
  operator: "gt";
  value: string;
};

export type QueryParams = {
  [key: string]:
    | QueryParamForEquals
    | QueryParamForOr
    | QueryParamForLowerThan
    | QueryParamForGreaterThan;
};

interface PermissionDefinition {
  neededParameters?: {
    name: string;
    operator: string;
    valueType: string;
    isPrimaryId?: boolean; // if this is the primary id of the table then it comes from the request as "id" and needs to be renamed
  }[]; // URL Parameters that are needed for the query
  checkPermissionsFor?: {
    name: string;
    checker: (
      userId: string,
      value: string | string[]
    ) => Promise<CrudPermission>;
    permission: "create" | "read" | "write" | "delete";
  }[];
  columns?: any;
  // custom SQL actions
  selector?: (userId: string, params: QueryParams) => Promise<any[]>; // custom selector function
  inserter?: (userId: string, body: any) => Promise<any>; // custom inserter function
  // custom actions to do some modifications with the data before the actual action
  preAction?: (userId: string, body: any) => Promise<any>; // custom pre-action function
  // postAction?: (userId: string, body: any) => Promise<any>; // custom post-action function
}

interface PermissionDefinitionPerMethod {
  [key: string]: PermissionDefinition | undefined;
  GET?: PermissionDefinition;
  POST?: PermissionDefinition;
  PUT?: PermissionDefinition;
  DELETE?: PermissionDefinition;
}

export interface PermissionDefinitionPerTable {
  [tablename: string]: PermissionDefinitionPerMethod;
}

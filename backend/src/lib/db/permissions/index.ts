import type { CrudPermission } from "./../../types/permissions";

export const getPermissionForProject = async (
  userId: string,
  projectId: string | string[]
): Promise<CrudPermission> => {
  return {
    read: true,
    write: true,
    delete: true,
    create: true,
  };
};

export const getPermissionForSite = async (
  userId: string,
  siteId: string | string[]
): Promise<CrudPermission> => {
  return {
    read: true,
    write: true,
    delete: true,
    create: true,
  };
};

export const getPermissionsForReport = async (
  userId: string,
  reportId: string | string[]
): Promise<CrudPermission> => {
  return {
    read: true,
    write: true,
    delete: true,
    create: true,
  };
};

export const getPermissionForSystemEquvalents = async (
  userId: string
): Promise<CrudPermission> => {
  if (userId === "admin") {
    return {
      read: true,
      write: true,
      delete: true,
      create: true,
    };
  } else {
    return {
      read: true,
      write: false,
      delete: false,
      create: false,
    };
  }
};

export const getPermissionForUserId = async (
  userId: string
): Promise<CrudPermission> => {
  return {
    read: true,
    write: false,
    delete: false,
    create: false,
  };
};

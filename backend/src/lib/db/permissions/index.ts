import { eq, inArray } from "drizzle-orm";
import { getDb } from "../db-connection";
import { projects, userProjects } from "../db-schema";
import type { CrudPermission } from "./../../types/permissions";

export const getAllUsersProjects = async (
  userId: string
): Promise<(typeof projects.$inferSelect)[]> => {
  return await getDb()
    .select()
    .from(projects)
    .where(
      inArray(
        projects.id,
        getDb()
          .select({ projectId: userProjects.projectId })
          .from(userProjects)
          .where(eq(userProjects.userId, userId))
      )
    );
};

export const getPermissionForProject = async (
  userId: string,
  projectId: string | string[]
): Promise<CrudPermission> => {
  const projects = await getAllUsersProjects(userId);
  const projectIds = projects.map((p) => p.id);

  if (Array.isArray(projectId)) {
    if (projectId.every((id) => projectIds.includes(id))) {
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
  } else if (projectIds.includes(projectId)) {
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

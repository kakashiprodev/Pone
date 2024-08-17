import type { Context } from "hono";
import { deleteFileFromDB, getFileFromDB } from "../../../../lib/storage/db";
import { HTTPException } from "hono/http-exception";

/**
 * Get a file
 */
export const GET = async (c: Context) => {
  try {
    const id = c.req.param("id");
    const bucket = c.req.param("bucket");

    // get the file
    const file = await getFileFromDB(id);

    return new Response(file, {
      status: 200,
      headers: {
        "Content-Type": "application/octet-stream",
      },
    });
  } catch (err) {
    throw new HTTPException(400, { message: err + "" });
  }
};

/**
 * Delete a file
 */
export const DELETE = async (c: Context) => {
  try {
    const id = c.req.param("id");

    // delete the file
    await deleteFileFromDB(id);

    return new Response(null, { status: 204 });
  } catch (err) {
    throw new HTTPException(400, { message: err + "" });
  }
};

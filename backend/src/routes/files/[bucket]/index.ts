import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { saveFileToDB } from "../../../lib/storage/db";

/**
 * Upload a new users avatar image
 */
export const POST = async (c: Context) => {
  try {
    const bucket = c.req.param("bucket");

    // check if the header is set to form-data
    const contentType = c.req.header("content-type");
    if (!contentType || !contentType.includes("multipart/form-data")) {
      return c.json({ message: "Invalid content type" }, { status: 400 });
    }
    // Parse the form data
    const form = await c.req.formData();
    const file = form.get("file") as File;

    // get the file type
    const fileType = file.type.split("/")[1];
    if (fileType && ["png", "jpeg", "jpg", "webp"].includes(fileType)) {
      // save the image with user id as filename
      const entry = await saveFileToDB(file, bucket);

      // return the URL
      return c.json({ id: entry });
    } else {
      return c.json({ message: "Invalid file type" }, { status: 400 });
    }
  } catch (err) {
    throw new HTTPException(400, { message: err + "" });
  }
};

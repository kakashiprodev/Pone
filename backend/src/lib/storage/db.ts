import { eq } from 'drizzle-orm';
import { getDb } from '../db/db-connection';
import { files } from '../db/schema/main';

export async function saveFileToDB(
  file: File,
  bucket: string,
  id?: string,
): Promise<string> {
  // Convert the file to a buffer
  const fileBuffer = Buffer.from(await file.arrayBuffer());

  const entry = {
    id: id ?? undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    bucket: bucket,
    name: file.name,
    fileType: file.type,
    file: fileBuffer,
  };

  // Insert the file into the database
  const e = await getDb()
    .insert(files)
    .values(entry)
    .onConflictDoUpdate({
      target: files.id,
      set: entry,
    })
    .returning();

  if (e.length === 0) {
    throw new Error('Failed to save file to database');
  }
  return e[0].id;
}

export async function getFileFromDB(id: string): Promise<File> {
  // Retrieve the file record from the database
  const fileRecord = await getDb().select().from(files).where(eq(files.id, id));

  if (fileRecord.length === 0) {
    throw new Error('File not found');
  }
  const file = fileRecord[0];

  // Create and return a File object
  return new File([file.file], file.name, { type: file.fileType });
}

export async function deleteFileFromDB(id: string): Promise<void> {
  // Delete the file record from the database
  await getDb().delete(files).where(eq(files.id, id));
}

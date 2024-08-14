import { deleteFileFromDB, getFileFromDB, saveFileToDB } from './db';

export const attachmenStorageType = 'db';

export async function saveFile(
  file: File,
  id: string,
  bucket: string,
): Promise<string> {
  return await saveFileToDB(file, bucket, id);
}

export async function getFile(
  id: string,
  extension: string,
  bucket: string,
): Promise<File> {
  return await getFileFromDB(id);
}

export async function deleteFile(
  id: string,
  extension: string,
  bucket: string,
): Promise<void> {
  await deleteFileFromDB(id);
}

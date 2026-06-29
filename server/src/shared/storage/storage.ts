import { LocalFileStorage } from './localStorage';

/**
 * Storage-agnostic file persistence. The rest of the app depends only on this
 * interface, so moving from local disk to S3 (or anything else) is a matter of
 * adding a new implementation and swapping it in `createStorage` below — no
 * changes needed in the files module or controllers.
 */
export interface FileStorage {
  save(key: string, buffer: Buffer, contentType?: string): Promise<void>;
  read(key: string): Promise<Buffer>;
  delete(key: string): Promise<void>;
}

function createStorage(): FileStorage {
  // When ready for S3: `if (process.env['STORAGE_DRIVER'] === 's3') return new S3FileStorage(...)`
  return new LocalFileStorage();
}

// Single shared instance used across the app.
export const fileStorage: FileStorage = createStorage();

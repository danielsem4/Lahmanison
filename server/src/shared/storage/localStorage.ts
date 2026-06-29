import { promises as fs } from 'fs';
import path from 'path';
import type { FileStorage } from './storage';

// Files are written under <server>/uploads (gitignored, created on demand).
const UPLOAD_ROOT = path.resolve(process.cwd(), 'uploads');

export class LocalFileStorage implements FileStorage {
  // Resolve a storage key to an absolute path, guarding against path traversal
  // via crafted keys (e.g. "../../etc/passwd").
  private resolve(key: string): string {
    const target = path.resolve(UPLOAD_ROOT, key);
    if (target !== UPLOAD_ROOT && !target.startsWith(UPLOAD_ROOT + path.sep)) {
      throw new Error('Invalid storage key');
    }
    return target;
  }

  async save(key: string, buffer: Buffer): Promise<void> {
    const target = this.resolve(key);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, buffer);
  }

  async read(key: string): Promise<Buffer> {
    return fs.readFile(this.resolve(key));
  }

  async delete(key: string): Promise<void> {
    try {
      await fs.unlink(this.resolve(key));
    } catch (err) {
      // Ignore a missing file so DB cleanup can still proceed.
      if ((err as NodeJS.ErrnoException).code !== 'ENOENT') throw err;
    }
  }
}

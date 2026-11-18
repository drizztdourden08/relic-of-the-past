/* @layer shared-storage @kind logic */
import { isZip, unzip } from '../archive';
import { kindOfFile } from './kind-of-file';

const UNREADABLE_ARCHIVE = /\.(7z|rar)$/i;

const romBodyOf = async (fileName: string, bytes: Uint8Array): Promise<Uint8Array | null | 'archive'> => {
  if (UNREADABLE_ARCHIVE.test(fileName)) return 'archive';
  if (!isZip(bytes)) return bytes;
  const entry = (await unzip(bytes)).find((candidate) => kindOfFile(candidate.name) !== null);
  return entry?.bytes ?? null;
};

export { romBodyOf };

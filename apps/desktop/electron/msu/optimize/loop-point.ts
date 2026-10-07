/* @layer electron-main @kind logic */
/**
 * The repeat point an MSU-1 file declares in its first eight bytes.
 *
 * A positional read, not the shared FileStore helper: FileStore reads WHOLE files, and
 * this runs over a whole pack. A file with no valid header answers null, the same as
 * "no repeat point": nothing to carry into the manifest.
 */
import { open } from 'fs/promises';
import { MSU1_HEADER_BYTES, MSU1_MAGIC_TEXT } from '@shared/types/msu1-format';

const MAGIC_BYTES = MSU1_MAGIC_TEXT.length;

/**
 * The repeat point in samples, or null when the file declares none. Zero reads as null:
 * an unset `loopSample` already means "from the beginning".
 */
const readLoopSample = async (filePath: string): Promise<number | null> => {
  let handle: Awaited<ReturnType<typeof open>> | null = null;
  try {
    handle = await open(filePath, 'r');
    const buffer = Buffer.alloc(MSU1_HEADER_BYTES);
    const { bytesRead } = await handle.read(buffer, 0, MSU1_HEADER_BYTES, 0);
    if (bytesRead < MSU1_HEADER_BYTES) return null;
    if (buffer.toString('latin1', 0, MAGIC_BYTES) !== MSU1_MAGIC_TEXT) return null;
    const sample = buffer.readUInt32LE(MAGIC_BYTES);
    return sample > 0 ? sample : null;
  } catch {
    return null;
  } finally {
    await handle?.close().catch(() => {});
  }
};

export { readLoopSample };

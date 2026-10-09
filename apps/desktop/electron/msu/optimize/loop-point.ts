/* @layer electron-main @kind logic */
import { open } from 'fs/promises';
import { MSU1_HEADER_BYTES, MSU1_MAGIC_TEXT } from '@rotp/msu';
import { MAGIC_BYTES } from './loop-point.constants';

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

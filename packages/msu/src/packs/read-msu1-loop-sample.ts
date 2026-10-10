/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import { MSU1_HEADER_BYTES, MSU1_MAGIC_TEXT } from '../msu1-format';
import { packFile } from '../paths';
import { MSU1_LOOP_SAMPLE_OFFSET } from './msu.constants';

const readMsu1LoopSample = async (
  files: FileStore, pack: string, fileName: string,
): Promise<number | null> => {
  if (!fileName.toLowerCase().endsWith('.pcm')) return null;
  const bytes = await files.readBytes(packFile(pack, fileName));
  if (bytes === null || bytes.byteLength < MSU1_HEADER_BYTES) return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const magic = String.fromCharCode(...bytes.subarray(0, 4));
  return magic === MSU1_MAGIC_TEXT ? view.getUint32(MSU1_LOOP_SAMPLE_OFFSET, true) : null;
};

export { readMsu1LoopSample };

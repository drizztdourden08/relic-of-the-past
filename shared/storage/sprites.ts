/* @layer shared-storage @kind logic */
/** Extracted-sprite storage over FileStore (sprites/<romStem>/*.png + debug/review JSON). */
import type { FileStore } from '@shared/platform';
import { readJson, writeJson } from './json';

const dir = (romFile: string): string => `sprites/${romFile.replace(/\.(sfc|smc)$/i, '')}`;

const check = async (files: FileStore, romFile: string): Promise<{ extracted: boolean; count: number }> => {
  const count = (await files.list(dir(romFile))).filter((n) => n.endsWith('.png')).length;
  return { extracted: count > 0, count };
};

const writeSprites = async (files: FileStore, romFile: string, buffers: { name: string; bytes: Uint8Array }[]): Promise<void> => {
  await files.remove(dir(romFile)); // clear stale before writing the fresh set
  for (const buf of buffers) await files.writeBytes(`${dir(romFile)}/${buf.name}`, buf.bytes);
};

const remove = async (files: FileStore, romFile: string): Promise<{ success: boolean; error?: string }> => {
  await files.remove(dir(romFile));
  return { success: true };
};

const loadDebug = (files: FileStore) => readJson<Record<string, unknown>>(files, 'sprite-debug.json', {});
const saveDebug = (files: FileStore, data: unknown) => writeJson(files, 'sprite-debug.json', data);
const loadReview = (files: FileStore) => readJson<Record<string, unknown>>(files, 'sprite-review.json', {});
const saveReview = (files: FileStore, data: unknown) => writeJson(files, 'sprite-review.json', data);

export { check, writeSprites, remove, loadDebug, saveDebug, loadReview, saveReview };

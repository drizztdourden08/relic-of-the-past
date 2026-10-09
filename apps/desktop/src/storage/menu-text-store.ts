/* @layer renderer-lib @kind logic */
import { assets } from '@rotp/roms';
import { listRomsWithStatus } from './roms-store';
import { runOnWorker } from './extraction-client';
import { platformFiles } from './platform-files';
import type { DecodedText } from './menu-text-store.type';

const cache = new Map<string, DecodedText>();

const decodeRom = async (romBytes: Uint8Array): Promise<DecodedText | null> => {
  try {
    return await runOnWorker<DecodedText>({ op: 'menu-text', romBytes });
  } catch {
    return null;
  }
};

const decodeFromRoms = async (langCode: string): Promise<DecodedText | null> => {
  let fallback: DecodedText | null = null;

  for (const { romFile } of await listRomsWithStatus()) {
    const romBytes = await assets.readRomBytes(platformFiles(), romFile);
    if (romBytes === null) continue;
    const decoded = await decodeRom(romBytes);
    if (decoded === null) continue;
    if (decoded.language === langCode) return decoded;
    fallback ??= decoded;
  }
  return fallback;
};

const menuTextFor = async (langCode: string): Promise<DecodedText | null> => {
  const hit = cache.get(langCode);
  if (hit !== undefined) return hit;

  const decoded = await decodeFromRoms(langCode);
  if (decoded !== null) cache.set(langCode, decoded);
  return decoded;
};

export { menuTextFor };
export type { DecodedText };

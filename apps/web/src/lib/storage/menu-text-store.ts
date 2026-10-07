/* @layer renderer-lib @kind logic */
/**
 * The menu, credits and closing-caption text, decoded on demand from the player's own ROM.
 * These bodies are not in a language pack (the extractor copies their bytes undecoded) and
 * are game-derived text, so they may never be committed. Cached in memory per language
 * because reaching them means reading a whole ROM.
 */
import * as assets from '@shared/storage/assets';
import { getPlatform } from '@app/platform/get-platform';
import { listRomsWithStatus } from './roms-store';
import { runOnWorker } from './extraction-client';
import type { DecodedLine } from '@shared/asset-extraction/text/menu-text';

/** The two groups the studio shows for a set, as slot-ready lines. */
type DecodedText = {
  /** The language of the ROM these came out of. Not necessarily the one asked for. */
  language: string;
  menu: DecodedLine[];
  credits: DecodedLine[];
};

const files = () => getPlatform().files;

const cache = new Map<string, DecodedText>();

/**
 * Every stored ROM this pipeline can read, decoded. The set's own language is preferred, but
 * another region still shows a translator what each slot HOLDS; the answering language travels
 * with the result so the studio can say where the words came from.
 */
const decodeFromRoms = async (langCode: string): Promise<DecodedText | null> => {
  let fallback: DecodedText | null = null;

  for (const { romFile } of await listRomsWithStatus()) {
    const romBytes = await assets.readRomBytes(files(), romFile);
    if (romBytes === null) continue;
    try {
      const decoded = await runOnWorker<DecodedText>({ op: 'menu-text', romBytes });
      if (decoded.language === langCode) return decoded;
      fallback ??= decoded;
    } catch {
      // A file the pipeline cannot read; the next one may be fine.
    }
  }
  return fallback;
};

/** The decoded bodies for a set's base language, or null when no matching ROM is stored (an ordinary state, not a failure). */
const menuTextFor = async (langCode: string): Promise<DecodedText | null> => {
  const hit = cache.get(langCode);
  if (hit !== undefined) return hit;

  const decoded = await decodeFromRoms(langCode);
  if (decoded !== null) cache.set(langCode, decoded);
  return decoded;
};

export { menuTextFor };
export type { DecodedText };

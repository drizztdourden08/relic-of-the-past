/* @layer renderer-lib @kind logic */
/**
 * The menu, credits and closing-caption text, read out of the player's own ROM.
 *
 * These bodies are not part of a language pack: the extractor copies their bytes
 * into the asset blob without ever decoding them, so the only way to show a
 * translator what they say is to decode them here, on demand. They are also
 * game-derived text, which means they may never be committed — deriving them
 * from the user's own file each session is the only shape that is both correct
 * and allowed.
 *
 * Kept in memory per language: a decode walks a few kilobytes, but reaching it
 * means reading a whole ROM, and the studio asks every time a set is opened.
 */
import * as assets from '@shared/storage/assets';
import { getPlatform } from '@app/platform/get-platform';
import { listRomsWithStatus } from './roms-store';
import { runOnWorker } from './extraction-client';
import type { DecodedLine } from '@shared/asset-extraction/text/menu-text';

/** The two groups the studio shows for a set, as slot-ready lines. */
type DecodedText = {
  /** The language of the ROM these came out of — not necessarily the one asked for. */
  language: string;
  menu: DecodedLine[];
  credits: DecodedLine[];
};

const files = () => getPlatform().files;

const cache = new Map<string, DecodedText>();

/**
 * Every stored ROM this pipeline can read, decoded.
 *
 * The set's own language is preferred, but a ROM in another region still shows a
 * translator what each slot HOLDS and what it has room for, which is most of the
 * value. The language that answered travels with the result so the studio can
 * say where the words came from rather than quietly implying they match.
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

/**
 * The decoded bodies for a set's base language, or null when no matching ROM is
 * stored. Null is an ordinary state — the studio lists those groups as having
 * nothing to show rather than treating it as a failure.
 */
const menuTextFor = async (langCode: string): Promise<DecodedText | null> => {
  const hit = cache.get(langCode);
  if (hit !== undefined) return hit;

  const decoded = await decodeFromRoms(langCode);
  if (decoded !== null) cache.set(langCode, decoded);
  return decoded;
};

export { menuTextFor };
export type { DecodedText };

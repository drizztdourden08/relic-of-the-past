/* @layer renderer-lib @kind logic */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { SpriteBuffer } from '@rotp/asset-extraction';
import { GAME_ROM_LANGUAGE } from '@rotp/asset-extraction';
import { findUsRom, romRelease } from '../asset-files';
import { runExtractStep } from '../extraction-client';
import { platformFiles } from '../platform-files';
import { fallbackDefs } from './fallback-defs';
import type { SpritesResult } from './sprites-store.type';

const usSpriteFallback = async (romFile: string, romBytes: Uint8Array, result: SpritesResult): Promise<SpriteBuffer[]> => {
  const { failed, defs } = fallbackDefs(result.errors);
  if (failed.size === 0 || (await romRelease(romBytes))?.language === GAME_ROM_LANGUAGE) return result.buffers;
  const usRom = await findUsRom(platformFiles());
  if (usRom === null) return result.buffers;
  const us = await runExtractStep<'sprites', SpritesResult>({
    step: 'sprites', title: msg('data-manager:jobs.extract-sprites', { rom: romFile }), subject: romFile, romBytes: usRom, input: { defs },
  });
  const added = us.buffers.filter((buffer) => [...failed].some((file) => buffer.name.startsWith(file)));
  const replaced = new Set(added.map((buffer) => buffer.name));
  return [...result.buffers.filter((buffer) => !replaced.has(buffer.name)), ...added];
};

export { usSpriteFallback };

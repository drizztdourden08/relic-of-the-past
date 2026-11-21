/* @layer renderer-lib @kind logic */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { FileStore } from '@drizztdourden08/brock-core';
import { GAME_ROM_LANGUAGE } from '@rotp/asset-extraction';
import { keepRomLanguage } from '@rotp/languages';
import type { ExtractedPack } from '@rotp/languages';
import { runExtractStep } from '../extraction-client';
import { LocalizedError } from '../localized-error';
import { NO_US_ROM_TEXT } from './asset-files.constants';
import { findUsRom } from './find-us-rom';
import { romRelease } from './rom-release';

const gameRomBytes = async (files: FileStore, picked: Uint8Array): Promise<Uint8Array> => {
  const release = await romRelease(picked);
  if (release === null || release.language === GAME_ROM_LANGUAGE) return picked;
  const pack = await runExtractStep<'language', ExtractedPack>({
    step: 'language', title: msg('data-manager:jobs.read-rom-language'), subject: 'rom', romBytes: picked, input: undefined,
  });
  await keepRomLanguage(files, pack);
  const usRom = await findUsRom(files);
  if (usRom === null) throw new LocalizedError(NO_US_ROM_TEXT);
  return usRom;
};

export { gameRomBytes };

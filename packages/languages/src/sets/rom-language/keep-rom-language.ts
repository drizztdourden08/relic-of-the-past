/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import { writeExtractionPayload } from '../pack';
import { readPayloadMeta } from '../pack/read-payload-meta';
import { getRomFont, getSet } from '../read';
import type { ExtractedPack } from '../types';
import { saveSet, writeRomFont } from '../write';
import { refreshRomScreens } from './refresh-rom-screens';
import { romSetInput } from './rom-set-input';

const keepRomLanguage = async (files: FileStore, pack: ExtractedPack): Promise<void> => {
  if (await readPayloadMeta(files, pack.code) === null) await writeExtractionPayload(files, pack);
  if (pack.script !== 'japanese' && await getRomFont(files, pack.code) === null) {
    await writeRomFont(files, pack.code, { fontData: pack.fontData, fontWidth: pack.fontWidth });
  }
  const { set } = romSetInput(pack);
  const stored = await getSet(files, set.id);
  if (stored === null) await saveSet(files, set);
  else await refreshRomScreens(files, stored, set);
};

export { keepRomLanguage };

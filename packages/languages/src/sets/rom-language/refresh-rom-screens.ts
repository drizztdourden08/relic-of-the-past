/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import type { LanguageSet } from '../../messages';
import { writeHeader } from '../format-2/write-header';
import { screensPath } from '../paths';
import { encodeScreens } from '../screens-codec';

// A ROM set's screens and script are read from its cartridge and never edited, so a kept set takes the
// ones the current extraction reads; its dialogue, names and variables stay as they are.
const refreshRomScreens = async (files: FileStore, stored: LanguageSet, fresh: LanguageSet): Promise<void> => {
  if (stored.origin !== 'rom') return;
  if (fresh.screens) {
    const encoded = encodeScreens(fresh.screens);
    if (await files.readText(screensPath(stored.id)) !== encoded) await files.writeText(screensPath(stored.id), encoded);
  }
  if (fresh.script && stored.script !== fresh.script) await writeHeader(files, { ...stored, script: fresh.script });
};

export { refreshRomScreens };

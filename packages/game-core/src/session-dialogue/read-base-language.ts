/* @layer bridge-wasm @kind logic */
import { findDatAsset } from '@rotp/asset-extraction';
import type { EmscriptenModule } from '../types';
import { dialogueMapEntryOf } from './dialogue-map-entry';

const readBaseLanguage = (mod: EmscriptenModule, setId: string): string => {
  try {
    const mapAsset = findDatAsset(mod.FS.readFile('/zelda3_assets.dat'), 'kDialogueMap');
    return mapAsset ? dialogueMapEntryOf(mapAsset, setId).base : setId;
  } catch {
    return setId;
  }
};

export { readBaseLanguage };

/* @layer bridge-wasm @kind logic */
import { compressStrings } from '@shared/asset-extraction/text/dialogue-encoder';
import {
  RANDOMIZER_MSG_BASE, randomizerTemplateTexts,
} from '@shared/asset-extraction/text/data/randomizer-templates';
import type { ActiveDialogue } from '../active-dialogue.type';

const baseChunksOf = (dialogue: ActiveDialogue): Uint8Array[] | null => {
  const { code, lineChunks } = dialogue;
  if (lineChunks.length < RANDOMIZER_MSG_BASE) return null;
  const templates = randomizerTemplateTexts(code);
  const baked = lineChunks.length - RANDOMIZER_MSG_BASE;
  if (baked >= templates.length) return lineChunks;
  return [...lineChunks, ...compressStrings([...templates.slice(baked)], code)];
};

export { baseChunksOf };

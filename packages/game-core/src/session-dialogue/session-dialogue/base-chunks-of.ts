/* @layer bridge-wasm @kind logic */
import { compressStrings, RANDOMIZER_MSG_BASE, randomizerTemplateTexts } from '@rotp/asset-extraction';
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

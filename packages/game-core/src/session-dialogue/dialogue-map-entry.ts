/* @layer bridge-wasm @kind logic */
import { GAME_ROM_LANGUAGE, unpackPackedBytes } from '@rotp/asset-extraction';
import type { DialogueMapEntry } from './dialogue-map-entry.type';

const dialogueMapEntryOf = (dialogueMap: Uint8Array, code: string): DialogueMapEntry => {
  const decoder = new TextDecoder();
  for (const entry of unpackPackedBytes(dialogueMap)) {
    const [codeBytes, conf, baseBytes] = unpackPackedBytes(entry);
    const index = conf?.[0];
    if (codeBytes === undefined || conf === undefined || conf.length < 3 || index === undefined) continue;
    if (decoder.decode(codeBytes) === code) return { index, base: baseBytes ? decoder.decode(baseBytes) : code };
  }
  // zelda_rtl.c ZeldaSetLanguage plays a set the blob lacks as the US cartridge's text, so the host reads it as US too.
  return { index: 0, base: GAME_ROM_LANGUAGE };
};

export { dialogueMapEntryOf };

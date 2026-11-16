/* @layer bridge-wasm @kind logic */
import { unpackPackedBytes } from '@rotp/asset-extraction';
import type { DialogueMapEntry } from './dialogue-map-entry.type';

const dialogueMapEntryOf = (dialogueMap: Uint8Array, code: string): DialogueMapEntry => {
  const decoder = new TextDecoder();
  for (const entry of unpackPackedBytes(dialogueMap)) {
    const [codeBytes, conf, baseBytes] = unpackPackedBytes(entry);
    const index = conf?.[0];
    if (codeBytes === undefined || conf === undefined || conf.length < 3 || index === undefined) continue;
    if (decoder.decode(codeBytes) === code) return { index, base: baseBytes ? decoder.decode(baseBytes) : code };
  }
  return { index: 0, base: code };
};

export { dialogueMapEntryOf };

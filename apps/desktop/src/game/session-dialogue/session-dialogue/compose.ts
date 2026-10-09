/* @layer bridge-wasm @kind logic */
import { kLanguages } from '@rotp/asset-extraction';
import { packPackedBytes } from '@rotp/asset-extraction';
import { log } from '../../../log-bus';
import { getModule } from '@rotp/game-core';
import { readActiveDialogue } from '@rotp/game-core';
import { sessionCharset } from '@rotp/game-core';
import { baseChunksOf } from '@rotp/game-core';
import { encodeLines } from '@rotp/game-core';
import { prepareLine } from '@rotp/game-core';
import { SESSION_FILE } from '@rotp/game-core';
import { sessionPool } from '@rotp/game-core';

const compose = (): boolean => {
  const mod = getModule();
  if (!mod) return false;
  sessionPool.active ??= readActiveDialogue(mod);
  const dialogue = sessionPool.active;
  if (dialogue === null) {
    log.randomizer('[Randomizer] Session dialogue skipped: asset blob unreadable', 'warn');
    return false;
  }
  const config = kLanguages[dialogue.code];
  if (!config) {
    log.randomizer(`[Randomizer] Session dialogue skipped: no encoder for language "${dialogue.code}"`, 'warn');
    return false;
  }
  const baseChunks = baseChunksOf(dialogue);
  if (baseChunks === null) {
    log.randomizer('[Randomizer] Session dialogue skipped: baked dialogue is incomplete', 'warn');
    return false;
  }
  const pool = [...sessionPool.arrivals.lines, ...sessionPool.plannedLines];
  try {
    const charset = sessionCharset(mod, config.alphabet, dialogue.fontWidths);
    const prepared = pool.map((line) => prepareLine(line, charset));
    const blob = packPackedBytes([
      dialogue.dictPacked,
      packPackedBytes([...baseChunks, ...encodeLines(prepared, dialogue.code)]),
    ]);
    mod.FS.writeFile(SESSION_FILE, blob);
    const adopted = mod.ccall('WasmLoadSessionDialogue', 'number', [], []);
    if (adopted < baseChunks.length + pool.length) return false;
    sessionPool.baseId = adopted - pool.length;
    return true;
  } catch (error) {
    log.randomizer(`[Randomizer] Session dialogue compose failed: ${String(error)}`, 'warn');
    return false;
  }
};

export { compose };

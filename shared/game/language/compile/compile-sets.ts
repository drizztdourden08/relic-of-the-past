/* @layer shared-game @kind logic */
/**
 * Bake a whole collection of editable language sets into the packed entries
 * the asset blob builder takes as its extras — the step both hosts run when
 * they recompile a ROM's asset blob (the main process in-process, the web
 * renderer inside its extraction Worker), so the semantics live here once
 * rather than in each host.
 *
 * Fault-tolerant by design: a single unbakeable set (an alphabet the base
 * language can't encode, a dialogue list that lost an entry) must not cost the
 * user every other language in the blob. Each set is compiled in isolation and
 * a failure is reported through `onWarn` — naming the set — and then skipped.
 *
 * Every stored set becomes an extra, with no id filtering. That matches what
 * the folder-scanning path it replaces did, including the one degenerate case:
 * a set whose id equals the base entry's code (`us`) is still baked, but the
 * core's lookup takes the first match in the map, so index 0 shadows it and
 * its content is unreachable. Preserved deliberately — dropping it here would
 * change which sets bake, which is not this change's job.
 *
 * Pure apart from the `onWarn` callback: no file or ROM I/O.
 */
import type { PackedLangEntry } from '@shared/asset-extraction/text/build-language-entry';
import type { LanguageSet } from '../types';
import { compileSet } from './compile-set';

/**
 * One set plus the font pair it bakes with, in the storage layer's own
 * currency (`Uint8Array`) so the value survives a structured-clone hop to a
 * Worker. The Node-Buffer wrapping `compileSet` wants happens here.
 */
type SetBakeInput = {
  set: LanguageSet;
  fontData: Uint8Array;
  fontWidth: Uint8Array;
};

const messageOf = (err: unknown): string => (err instanceof Error ? err.message : String(err));

const compileSets = (inputs: SetBakeInput[], onWarn: (message: string) => void): PackedLangEntry[] => {
  const packed: PackedLangEntry[] = [];

  for (const { set, fontData, fontWidth } of inputs) {
    try {
      packed.push(compileSet(set, {
        fontData: Buffer.from(fontData),
        fontWidth: Buffer.from(fontWidth),
      }));
    } catch (err) {
      onWarn(`Language set "${set.id}" failed to compile and was skipped: ${messageOf(err)}`);
    }
  }

  return packed;
};

export { compileSets };
export type { SetBakeInput };

/* @layer shared-asset-extraction @kind types */
/**
 * Types for the multi-source asset set.
 *
 * The base cartridge is required: if it fails to compile there is no game, so it throws.
 * Everything else is optional and must never be able to take the base down with it, which
 * is why an optional source reports failure as data rather than raising.
 */
import type { GbaRomReader } from '../rom/gba-rom';
import type { RomData } from '../rom/rom-types';
import type { AssetSourceId } from './source-ids';

interface AlttpAssetSources {
  snes: RomData;
  gbaAlttp?: GbaRomReader;
  /**
   * The per-room object streams solved from the GBA cartridge's baked maps. Solving needs a
   * live engine instance, so the caller performs it (against the freshly-compiled base) and
   * hands the result in; the compile itself stays synchronous and pure.
   */
  gbaStreams?: {
    streams: ReadonlyMap<number, Buffer>;
    rawRuns: ReadonlyMap<number, Buffer>;
  };
  /** Why solving the streams failed, when it was attempted and did not produce a map. */
  gbaStreamsError?: string;
}

type SourceOutcome =
  | { id: AssetSourceId; ok: true; container: Buffer }
  | { id: AssetSourceId; ok: false; reason: string };

/**
 * One optional cartridge. It owns both halves of its own job — deciding whether the user
 * supplied it, and compiling it — so adding a source is a registry entry rather than
 * another branch inside the compiler.
 */
interface OptionalSource {
  id: AssetSourceId;
  /** Returns null when this source's ROM was not supplied. */
  compile: (sources: AlttpAssetSources) => Buffer | null;
}

interface CompiledAlttpAssetSet {
  base: Buffer;
  supplements: SourceOutcome[];
}

export type { AlttpAssetSources, CompiledAlttpAssetSet, OptionalSource, SourceOutcome };

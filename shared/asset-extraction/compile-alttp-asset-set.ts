/* @layer shared-asset-extraction @kind logic */
/**
 * Source aggregator for the complete asset set.
 *
 * SNES remains the authoritative base and is compiled exactly as it always was, so its
 * bytes are unaffected by anything here. Optional cartridges contribute separate,
 * self-describing containers that are stored as their own files and only joined at load.
 *
 * Each optional source gets its own error boundary. An unreadable or unrecognised extra
 * cartridge must degrade to "no supplement", never to "no game". This was previously one
 * shared try block, so a bad optional ROM failed the whole compile and left the user with
 * no assets at all — the base game stopped building because an extra could not be read.
 */
import { compileResources } from './compile-resources';
import { OPTIONAL_SOURCES } from './sources/optional-sources';
import type { CompileOptions } from './compile-resources';
import type { AlttpAssetSources, CompiledAlttpAssetSet, SourceOutcome } from './sources/source.type';

const reasonOf = (error: unknown): string => (error instanceof Error ? error.message : String(error));

/**
 * Solves the GBA rooms' object streams against the freshly-compiled base container. Provided
 * by the caller because it needs a live engine instance, which only the caller can host —
 * the extraction worker fetches the engine build, a test reads it from disk.
 */
type SolveStreams = (base: Buffer) => Promise<ReadonlyMap<number, Buffer>>;

const compileAlttpAssetSet = async (
  sources: AlttpAssetSources,
  options: CompileOptions = {},
  solveStreams?: SolveStreams,
): Promise<CompiledAlttpAssetSet> => {
  const base = compileResources(sources.snes, options);

  const resolved = { ...sources };
  if (resolved.gbaAlttp && !resolved.gbaStreams && solveStreams) {
    try {
      resolved.gbaStreams = await solveStreams(base);
    } catch (error) {
      // Solving is part of the optional source: its failure surfaces as that source's
      // failure below, with the real reason, never as a failed base compile.
      resolved.gbaStreamsError = reasonOf(error);
    }
  }

  const supplements = OPTIONAL_SOURCES.flatMap((source): SourceOutcome[] => {
    try {
      const container = source.compile(resolved);
      return container ? [{ id: source.id, ok: true, container }] : [];
    } catch (error) {
      return [{ id: source.id, ok: false, reason: reasonOf(error) }];
    }
  });

  return { base, supplements };
};

export { compileAlttpAssetSet };
export type { SolveStreams };
export type { AlttpAssetSources, CompiledAlttpAssetSet };

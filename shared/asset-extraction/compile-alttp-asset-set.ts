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

const compileAlttpAssetSet = (
  sources: AlttpAssetSources,
  options: CompileOptions = {},
): CompiledAlttpAssetSet => {
  const base = compileResources(sources.snes, options);

  const supplements = OPTIONAL_SOURCES.flatMap((source): SourceOutcome[] => {
    try {
      const container = source.compile(sources);
      return container ? [{ id: source.id, ok: true, container }] : [];
    } catch (error) {
      return [{ id: source.id, ok: false, reason: reasonOf(error) }];
    }
  });

  return { base, supplements };
};

export { compileAlttpAssetSet };
export type { AlttpAssetSources, CompiledAlttpAssetSet };

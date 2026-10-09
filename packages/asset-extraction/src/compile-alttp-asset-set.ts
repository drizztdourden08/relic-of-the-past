/* @layer shared-asset-extraction @kind logic */
import { compileResources } from './compile-resources';
import { OPTIONAL_SOURCES } from './sources/optional-sources';
import type { CompileOptions } from './compile-resources';
import type { AlttpAssetSources, CompiledAlttpAssetSet, SourceOutcome } from './sources/source.type';

const reasonOf = (error: unknown): string => (error instanceof Error ? error.message : String(error));

const compileAlttpAssetSet = async (
  sources: AlttpAssetSources,
  options: CompileOptions = {},
): Promise<CompiledAlttpAssetSet> => {
  const base = compileResources(sources.snes, options);

  const resolved = { ...sources };
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
export type { AlttpAssetSources, CompiledAlttpAssetSet };

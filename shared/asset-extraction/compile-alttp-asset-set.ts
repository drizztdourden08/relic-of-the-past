/* @layer shared-asset-extraction @kind logic */
/**
 * Source aggregator for the complete ALttP asset set.
 *
 * SNES remains the authoritative base. The optional GBA ROM contributes only the
 * ALttP additions and overrides carried by a versioned supplement. Keeping the two
 * containers separate preserves the existing SNES asset signature and makes the
 * optional source explicit at the engine boundary.
 */
import { compileGbaAlttpSupplement } from './compile-resources-gba-alttp';
import { compileResources } from './compile-resources';
import type { CompileOptions } from './compile-resources';
import type { GbaRomReader } from './rom/gba-rom';
import type { RomData } from './rom/rom-types';

interface AlttpAssetSources {
  snes: RomData;
  gbaAlttp?: GbaRomReader;
}

interface CompiledAlttpAssetSet {
  base: Buffer;
  gbaSupplement?: Buffer;
}

const compileAlttpAssetSet = (
  sources: AlttpAssetSources,
  options: CompileOptions = {},
): CompiledAlttpAssetSet => {
  const base = compileResources(sources.snes, options);
  const gbaSupplement = sources.gbaAlttp
    ? compileGbaAlttpSupplement(sources.gbaAlttp)
    : undefined;
  return { base, ...(gbaSupplement ? { gbaSupplement } : {}) };
};

export { compileAlttpAssetSet };
export type { AlttpAssetSources, CompiledAlttpAssetSet };

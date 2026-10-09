/* @layer shared-asset-extraction @kind logic */
import { compileGbaAlttpSupplement } from '../compile-resources-gba-alttp';
import type { AlttpAssetSources } from './source.type';

const compileGbaAlttpSource = (sources: AlttpAssetSources): Buffer | null => {
  if (!sources.gbaAlttp) return null;
  return compileGbaAlttpSupplement(sources.gbaAlttp, sources.snes);
};

export { compileGbaAlttpSource };

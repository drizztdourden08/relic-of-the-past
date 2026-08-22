/* @layer shared-asset-extraction @kind data */
/**
 * Every optional cartridge that can add to the base game, in the order their containers
 * are appended at load time. The engine sniffs containers positionally, so this order is
 * part of the on-disk contract — append new sources, never reorder existing ones.
 */
import { compileGbaAlttpSupplement } from '../compile-resources-gba-alttp';
import type { AlttpAssetSources, OptionalSource } from './source.type';

const OPTIONAL_SOURCES: OptionalSource[] = [
  {
    id: 'gba-alttp',
    compile: (sources: AlttpAssetSources) =>
      sources.gbaAlttp ? compileGbaAlttpSupplement(sources.gbaAlttp) : null,
  },
];

export { OPTIONAL_SOURCES };

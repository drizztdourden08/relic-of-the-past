/* @layer shared-asset-extraction @kind constants */
import { kEffectNames, kKeys } from './spc-command-tables.constants';

const OCTAVES = [0, 1, 2, 3, 4, 5];

const kEffectNamesDict = new Map(kEffectNames.map((n, i) => [n, i]));

const kKeysDict = new Map<string, number>([
  ...OCTAVES.flatMap((j) => kKeys.map((key, i): [string, number] => [`${key}${j + 1}`, i + j * 12])),
  ['-+-', 72],
  ['---', 73],
]);

const kGapStartAddrs = new Set([0x2b00, 0x2880, 0xd000]);

const DUPLICATE_SAMPLE_SOURCES = new Map([[10, 9], [20, 19]]);

export { DUPLICATE_SAMPLE_SOURCES, kEffectNamesDict, kGapStartAddrs, kKeysDict };

/* @layer shared-asset-extraction @kind types */
import type { EntranceArrays } from '../../extensions/second-cartridge-links';

type EntranceTable = EntranceArrays & { entrance: number[] };

type EntranceValueKind = 'word' | 'byte' | 'int8';

type EntranceColumnKey = Exclude<keyof EntranceTable, 'relCoords'>;

type EntranceColumn = {
  key: EntranceColumnKey;
  kind: EntranceValueKind;
  main: number | null;
  extra: number | null;
};

type EntranceAdder = 'addUint8' | 'addUint16' | 'addInt8';

type EntranceAsset = {
  key: keyof EntranceTable;
  name: string;
  add: EntranceAdder;
  onlySet?: 0 | 1;
};

type EntranceSpec = {
  set: 0 | 1;
  count: number;
  prefix: string;
};

export type { EntranceAdder, EntranceAsset, EntranceColumn, EntranceColumnKey, EntranceSpec, EntranceTable, EntranceValueKind };

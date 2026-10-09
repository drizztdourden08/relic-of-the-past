/* @layer shared-asset-extraction @kind types */
import type { DungeonEntityRecord } from '../../../dungeon/model';

interface ParsedEntityList {
  sortMode: number;
  records: DungeonEntityRecord[];
}

export type { ParsedEntityList };

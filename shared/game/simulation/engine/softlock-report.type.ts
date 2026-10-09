/* @layer shared-game @kind types */
import type { CheckRecord, ScreenRecord } from '../../data';
import type { Adjacency } from './traversal/traversal.type';

interface ReportDeps {
  adjacency?: Adjacency;
  checks?: CheckRecord[];
  screens?: ScreenRecord[];
}

export type { ReportDeps };

/* @layer renderer-lib @kind types */
import type { ActiveLayer } from './channel.type';

interface ActiveProgram {
  id: number;
  startedAt: number;
  layers: ActiveLayer[];
}

export type { ActiveProgram };

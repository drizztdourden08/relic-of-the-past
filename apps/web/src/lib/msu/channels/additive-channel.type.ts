/* @layer renderer-lib @kind types */
import type { ActiveLayer } from './channel.type';

interface LiveSet {
  id: number;
  startedAt: number;
  layers: ActiveLayer[];
  out: AudioNode;
}

export type { LiveSet };

/* @layer renderer-lib @kind logic */
import type { LayerResume, MsuLayer } from '@shared/types/msu-manifest';

const createTriggerPool = () => {
  const last = new Map<string, number>();

  const pick = (layer: MsuLayer, fileCount: number): LayerResume | null => {
    if (layer.mode.kind !== 'once' || fileCount <= 1) return null;

    const previous = last.get(layer.id);
    const skip = previous !== undefined && previous < fileCount;
    let index = Math.floor(Math.random() * (skip ? fileCount - 1 : fileCount));
    if (skip && previous !== undefined && index >= previous) index += 1;

    last.set(layer.id, index);
    return { fileIndex: index, offsetSeconds: 0, nextEventInSeconds: null };
  };

  return { pick };
};

export { createTriggerPool };
export type { TriggerPool } from './trigger-pool.type';

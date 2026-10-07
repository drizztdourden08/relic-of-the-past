/* @layer renderer-lib @kind logic */
/**
 * Which file each layer of an additive channel uses for THIS trigger.
 *
 * A sword swing authored with four recordings should sound like four recordings, not like the
 * first one four times. That variation is a property of the trigger, not of the play mode, so
 * it is chosen here and handed to the scheduler as the file to start on, so no new play mode, and
 * the continuous modes (which already draw from their own pool) are left alone.
 *
 * Deliberately unseeded: an effect firing differently each time is the point. Only the exporter,
 * which has to produce the same bytes twice, needs a seeded generator.
 */
import type { LayerResume, MsuLayer } from '@shared/types/msu-manifest';

const createTriggerPool = () => {
  // Last file used, per layer. Enough to keep a repeat from landing twice running.
  const last = new Map<string, number>();

  /** A file for this trigger, or null to let the scheduler start where it normally would. */
  const pick = (layer: MsuLayer, fileCount: number): LayerResume | null => {
    if (layer.mode.kind !== 'once' || fileCount <= 1) return null;

    // Draw uniformly from every file EXCEPT the one this layer just used: the same sample twice
    // running reads as the variation being broken, which is the whole thing being fixed here.
    const previous = last.get(layer.id);
    const skip = previous !== undefined && previous < fileCount;
    let index = Math.floor(Math.random() * (skip ? fileCount - 1 : fileCount));
    if (skip && previous !== undefined && index >= previous) index += 1;

    last.set(layer.id, index);
    return { fileIndex: index, offsetSeconds: 0, nextEventInSeconds: null };
  };

  return { pick };
};

type TriggerPool = ReturnType<typeof createTriggerPool>;

export { createTriggerPool };
export type { TriggerPool };

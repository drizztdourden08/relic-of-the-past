/* @layer shared-hud @kind logic */
import { resolveExtent } from '../resolve-extent';
import type { Extent } from '../../../types/hud/hud-node';
import type { MeasureContext } from '../engine.type';

const sizeTracks = (
  tracks: readonly Extent[], natural: readonly number[], available: number, gap: number, ctx: MeasureContext,
): number[] => {
  const resolved = tracks.map((track, i) => resolveExtent(track, natural[i], available, ctx));
  if (!Number.isFinite(available)) return resolved.map((v) => (v === 'fill' ? 0 : v));
  const gapTotal = gap * Math.max(0, tracks.length - 1);
  const fixedTotal = resolved.reduce((sum: number, v) => sum + (v === 'fill' ? 0 : v), 0);
  const fillCount = resolved.filter((v) => v === 'fill').length;
  const leftover = fillCount ? Math.max(0, available - fixedTotal - gapTotal) / fillCount : 0;
  return resolved.map((v) => (v === 'fill' ? leftover : v));
};

export { sizeTracks };

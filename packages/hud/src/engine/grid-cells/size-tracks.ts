/* @layer shared-hud @kind logic */
import { resolveExtent } from '../resolve-extent';
import type { MeasureContext } from '../engine.type';
import type { TrackSizing } from './grid-cells.type';

const naturalAt = (natural: readonly number[], i: number): number => {
  const size = natural[i];
  if (size === undefined) throw new Error(`sizeTracks: no natural size for track ${i}`);
  return size;
};

const sizeTracks = (sizing: TrackSizing, ctx: MeasureContext): number[] => {
  const { tracks, natural, available, gap } = sizing;
  const resolved = tracks.map((track, i) => resolveExtent(track, naturalAt(natural, i), available, ctx));
  if (!Number.isFinite(available)) return resolved.map((v) => (v === 'fill' ? 0 : v));
  const gapTotal = gap * Math.max(0, tracks.length - 1);
  const fixedTotal = resolved.reduce((sum: number, v) => sum + (v === 'fill' ? 0 : v), 0);
  const fillCount = resolved.filter((v) => v === 'fill').length;
  const leftover = fillCount ? Math.max(0, available - fixedTotal - gapTotal) / fillCount : 0;
  return resolved.map((v) => (v === 'fill' ? leftover : v));
};

export { sizeTracks };

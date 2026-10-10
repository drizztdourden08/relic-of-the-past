/* @layer renderer-components @kind logic */
import type { LayerPlayMode, MsuLayer } from '@rotp/game-data';
import { MAX_CROSSFADE_SECONDS } from '@rotp/hub-contracts';
import { DEFAULT_CROSSFADE_SECONDS } from './layer-ops.constants';

const clampCrossfade = (seconds: number | undefined): number => {
  if (seconds === undefined || !Number.isFinite(seconds)) return DEFAULT_CROSSFADE_SECONDS;
  return Math.max(0, Math.min(MAX_CROSSFADE_SECONDS, seconds));
};

const normalizeMode = (mode: LayerPlayMode): LayerPlayMode => {
  if (mode.kind === 'loop') {
    const crossfadeSeconds = clampCrossfade(mode.crossfadeSeconds);
    const { kind, order } = mode;
    return crossfadeSeconds > DEFAULT_CROSSFADE_SECONDS
      ? { kind, order, crossfadeSeconds }
      : { kind, order };
  }
  if (mode.kind === 'random') {
    const { kind, minDelaySeconds, maxDelaySeconds } = mode;
    return mode.waitForCompletion === true
      ? { kind, minDelaySeconds, maxDelaySeconds, waitForCompletion: true }
      : { kind, minDelaySeconds, maxDelaySeconds };
  }
  return mode;
};

const normalizeLayers = (layers: MsuLayer[]): MsuLayer[] =>
  layers.map((layer) => ({ ...layer, mode: normalizeMode(layer.mode) }));

export { normalizeLayers };

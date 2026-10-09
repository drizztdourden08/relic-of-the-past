/* @layer renderer-components @kind logic */
import type { MsuLayer } from '@shared/types/msu-manifest';
import { MAX_CROSSFADE_SECONDS } from '@shared/types/msu-manifest';

const isLegalCrossfade = (seconds: number | undefined): boolean =>
  seconds === undefined
  || (Number.isFinite(seconds) && seconds >= 0 && seconds <= MAX_CROSSFADE_SECONDS);

const validateLayers = (layers: MsuLayer[]): string | null => {
  for (const layer of layers) {
    const label = layer.name.trim() || 'A layer';
    if (layer.files.length === 0) return `${label} has no audio files.`;
    if (layer.mode.kind === 'loop' && !isLegalCrossfade(layer.mode.crossfadeSeconds)) {
      return `${label}: the crossfade must be between 0 and ${MAX_CROSSFADE_SECONDS} seconds.`;
    }
    if (layer.mode.kind === 'random' && layer.mode.minDelaySeconds > layer.mode.maxDelaySeconds) {
      return `${label}: the shortest gap cannot be longer than the longest.`;
    }
    if (layer.mode.kind === 'interval' && layer.mode.atSeconds.length === 0) {
      return `${label}: an interval layer needs at least one time.`;
    }
  }
  return null;
};

export { validateLayers };

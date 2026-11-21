/* @layer renderer-components @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { MsuLayer } from '@rotp/game-data';
import { MAX_CROSSFADE_SECONDS } from '@rotp/hub-contracts';

const isLegalCrossfade = (seconds: number | undefined): boolean =>
  seconds === undefined
  || (Number.isFinite(seconds) && seconds >= 0 && seconds <= MAX_CROSSFADE_SECONDS);

const validateLayers = (t: I18n['t'], layers: MsuLayer[]): string | null => {
  for (const layer of layers) {
    const name = layer.name.trim() || t('msu-studio:layers.validate.unnamed');
    if (layer.files.length === 0) return t('msu-studio:layers.validate.no-files', { name });
    if (layer.mode.kind === 'loop' && !isLegalCrossfade(layer.mode.crossfadeSeconds)) {
      return t('msu-studio:layers.validate.crossfade', { name, max: MAX_CROSSFADE_SECONDS });
    }
    if (layer.mode.kind === 'random' && layer.mode.minDelaySeconds > layer.mode.maxDelaySeconds) {
      return t('msu-studio:layers.validate.gap', { name });
    }
    if (layer.mode.kind === 'interval' && layer.mode.atSeconds.length === 0) {
      return t('msu-studio:layers.validate.interval', { name });
    }
  }
  return null;
};

export { validateLayers };

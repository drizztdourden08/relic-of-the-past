/* @layer renderer-widgets @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
const targetLayerOf = (t: I18n['t'], toggles: boolean, playerLayer: number | null | undefined): string | null => {
  if (!toggles || playerLayer == null) return null;
  return playerLayer === 0 ? t('views-navigation:layer.lower') : t('views-navigation:layer.upper');
};

export { targetLayerOf };

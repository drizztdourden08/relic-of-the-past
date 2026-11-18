/* @layer renderer-widgets @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
const worldTag = (t: I18n['t'], isIndoors: boolean, isDarkWorld: boolean): string => {
  if (isIndoors) return t('views-navigation:world.indoor');
  return isDarkWorld ? t('views-navigation:world.dw') : t('views-navigation:world.lw');
};

export { worldTag };

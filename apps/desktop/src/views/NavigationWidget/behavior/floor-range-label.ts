/* @layer renderer-widgets @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
const floorRangeLabel = (t: I18n['t'], above: number, basement: number): string => {
  if (above > 0 && basement > 0) return t('views-navigation:floor.both', { above, basement });
  if (above > 0) return t('views-navigation:floor.above', { above });
  if (basement > 0) return t('views-navigation:floor.basement', { basement });
  return t('views-navigation:floor.none');
};

export { floorRangeLabel };

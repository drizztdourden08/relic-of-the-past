/* @layer renderer-widgets @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import { HEART_UNITS } from '../PlayerTab.constants';

const heartCellTitle = (t: I18n['t'], cell: number, capacity: number): string => {
  const owned = Math.floor(capacity / HEART_UNITS);
  return cell < owned ? t('views-cheats:heart.owned', { n: cell + 1 }) : t('views-cheats:heart.raise', { count: cell + 1 });
};

export { heartCellTitle };

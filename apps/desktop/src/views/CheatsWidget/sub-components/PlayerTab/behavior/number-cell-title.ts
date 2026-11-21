/* @layer renderer-widgets @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';

const numberCellTitle = (t: I18n['t'], label: string, lockedReason: string | undefined): string =>
  (lockedReason ? t('views-cheats:number.locked', { label, reason: lockedReason }) : t('views-cheats:number.seed', { label }));

export { numberCellTitle };

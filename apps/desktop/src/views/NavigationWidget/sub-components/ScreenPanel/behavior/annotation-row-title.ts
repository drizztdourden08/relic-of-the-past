/* @layer renderer-widgets @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { ScreenAnnotation } from '@rotp/navigation';

const annotationRowTitle = (t: I18n['t'], item: ScreenAnnotation, off: boolean): string => {
  const base = { kind: item.kind, row: item.tile.row, col: item.tile.col, off: off ? 'yes' : 'no' };
  if (item.layer === undefined) return t('views-navigation:annotation.row.title', base);
  return t('views-navigation:annotation.row.layer', { ...base, layer: item.layer });
};

export { annotationRowTitle };

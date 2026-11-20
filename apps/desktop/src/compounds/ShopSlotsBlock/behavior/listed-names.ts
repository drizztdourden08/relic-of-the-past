/* @layer renderer-components @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';

const listedNames = (names: readonly string[], t: I18n['t']): string => {
  const last = names[names.length - 1];
  if (names.length <= 1 || last === undefined) return names.join('');
  return t('compounds:shop-slots-block.list-and', { head: names.slice(0, -1).join(', '), last });
};

export { listedNames };

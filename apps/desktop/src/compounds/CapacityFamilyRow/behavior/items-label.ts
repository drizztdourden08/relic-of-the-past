/* @layer renderer-components @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
const itemsLabel = (count: number, t: I18n['t']): string => t('compounds:capacity.items', { count });

export { itemsLabel };

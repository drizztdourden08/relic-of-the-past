/* @layer renderer-components @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import { listSummary } from './list-summary';

const triggerSummary = (t: I18n['t'], triggers: string[]): string => listSummary(t, triggers);

export { triggerSummary };

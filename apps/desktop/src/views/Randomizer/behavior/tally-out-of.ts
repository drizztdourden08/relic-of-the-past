/* @layer renderer-components @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { Tally } from './options-summary.type';

const outOf = (t: I18n['t'], tally: Tally): string => t('views-randomizer:tally.outOf', { count: tally.count, total: tally.total });

export { outOf };

/* @layer renderer-widgets @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { CheckGrantPlan } from '@app/game';

const detailOf = (t: I18n['t'], plan: CheckGrantPlan): string =>
  (plan.kind === 'blocked' ? t('views-cheats:checks.blocked', { reason: plan.reason }) : t('views-cheats:checks.gives', { item: plan.itemLabel }));

export { detailOf };

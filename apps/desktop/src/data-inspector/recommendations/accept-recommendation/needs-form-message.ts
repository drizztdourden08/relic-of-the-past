/* @layer renderer-app @kind logic */
import { msg } from '@drizztdourden08/brock-core/i18n';
import { optionText } from '@rotp/randomizer';
const needsFormMessage = (blockers: readonly string[]): string =>
  optionText(msg('views-data-inspector:err.needsForm', { blockers: blockers.join(', ') }));

export { needsFormMessage };

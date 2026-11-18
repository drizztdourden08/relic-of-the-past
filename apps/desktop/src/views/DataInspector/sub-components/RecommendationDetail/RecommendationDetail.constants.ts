/* @layer renderer-app @kind data */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { Message } from '@drizztdourden08/brock-core/i18n';
import type { Recommendation } from '@rotp/navigation';

const CURRENT_TITLE = msg('views-data-inspector:rec.current');
const PROPOSED_TITLE = msg('views-data-inspector:rec.proposed');
const NO_CURRENT = msg('views-data-inspector:rec.no-current');
const NO_PROPOSAL = msg('views-data-inspector:rec.no-proposal');
const NOTHING_OPEN = msg('views-data-inspector:rec.nothing-open');

const ACCEPT_LABEL = msg('views-data-inspector:rec.accept');
const REJECT_LABEL = msg('views-data-inspector:rec.reject');
const REVERT_LABEL = msg('views-data-inspector:rec.revert');

const ACTION_LABEL: Record<Recommendation['action'], Message> = {
  create: msg('views-data-inspector:rec.action.create'),
  update: msg('views-data-inspector:rec.action.update'),
  delete: msg('views-data-inspector:rec.action.delete'),
};

export {
  ACCEPT_LABEL, ACTION_LABEL, CURRENT_TITLE, NO_CURRENT, NO_PROPOSAL, NOTHING_OPEN, PROPOSED_TITLE, REJECT_LABEL, REVERT_LABEL,
};

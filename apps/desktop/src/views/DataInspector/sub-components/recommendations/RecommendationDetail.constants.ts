/* @layer renderer-app @kind data */
import type { Recommendation } from '@rotp/navigation';

const CURRENT_TITLE = 'Current';
const PROPOSED_TITLE = 'Proposed';
const NO_CURRENT = 'This record does not exist yet. The finding proposes adding it.';
const NO_PROPOSAL = 'This finding carries no proposal.';
const NOTHING_OPEN = 'Select a finding to compare it against the dataset.';

const ACCEPT_LABEL = 'Accept';
const REJECT_LABEL = 'Reject';
const REVERT_LABEL = 'Revert edits';
const ACCEPT_ALL_LABEL = 'Accept all certain';

const ACTION_LABEL: Record<Recommendation['action'], string> = {
  create: 'Add',
  update: 'Change',
  delete: 'Remove',
};

const NOWHERE = 'no screen';

export {
  ACCEPT_ALL_LABEL, ACCEPT_LABEL, ACTION_LABEL, CURRENT_TITLE, NO_CURRENT, NO_PROPOSAL, NOTHING_OPEN, NOWHERE,
  PROPOSED_TITLE, REJECT_LABEL, REVERT_LABEL,
};

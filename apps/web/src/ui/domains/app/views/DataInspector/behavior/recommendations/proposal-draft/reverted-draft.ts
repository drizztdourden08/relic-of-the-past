/* @layer renderer-app @kind logic */
import { NO_DRAFT } from '../recommendations.constants';
import type { ProposalDraft } from '../recommendations.type';

const revertedDraft = (): ProposalDraft => NO_DRAFT;

export { revertedDraft };

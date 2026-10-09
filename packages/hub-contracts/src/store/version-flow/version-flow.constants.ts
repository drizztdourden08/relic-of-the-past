/* @layer shared-store @kind constants */
import type { ReviewState } from '../review-types';
import type { Actor, FlowStep, VersionAction } from './version-flow.type';

const AUTHOR: readonly Actor[] = ['author'];
const REVIEWER: readonly Actor[] = ['reviewer'];
const EITHER: readonly Actor[] = ['author', 'reviewer'];

const VERSION_FLOW: Record<ReviewState, Partial<Record<VersionAction, FlowStep>>> = {
  uploading: { abort: { to: 'deleted', by: EITHER } },
  ready: {
    submit: { to: 'waiting', by: AUTHOR },
    reject: { to: 'rejected', by: REVIEWER },
    delete: { to: 'deleted', by: EITHER },
  },
  waiting: {
    withdraw: { to: 'ready', by: AUTHOR },
    approve: { to: 'approved', by: REVIEWER },
    reject: { to: 'rejected', by: REVIEWER },
    delete: { to: 'deleted', by: EITHER },
  },
  rejected: {
    submit: { to: 'waiting', by: AUTHOR },
    delete: { to: 'deleted', by: EITHER },
  },
  approved: { delete: { to: 'deleted', by: REVIEWER } },
  deleted: {},
};

const NEEDS_FILE: readonly VersionAction[] = ['submit', 'approve'];

const IN_FLIGHT: readonly ReviewState[] = ['uploading', 'ready', 'waiting'];

const DAY_MS = 24 * 60 * 60 * 1000;

export { VERSION_FLOW, NEEDS_FILE, IN_FLIGHT, DAY_MS };

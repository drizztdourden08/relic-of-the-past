/* @layer store-site @kind constants */
import type { Actor, VersionAction } from '@rotp/hub-contracts';

const REVIEWER: readonly Actor[] = ['reviewer'];
const EDIT_ACTIONS: readonly VersionAction[] = ['approve', 'reject'];

export { REVIEWER, EDIT_ACTIONS };

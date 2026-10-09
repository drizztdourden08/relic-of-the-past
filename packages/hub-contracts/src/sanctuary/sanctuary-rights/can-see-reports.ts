/* @layer shared-sanctuary @kind logic */
import { hasRight } from '../../hub/rights';
import type { Rights } from '../../hub/group-types';
import { REPORTS_PERMISSION } from './sanctuary-permissions.constants';

const canSeeReports = (rights: Rights | null): boolean => hasRight(rights, REPORTS_PERMISSION);

export { canSeeReports };

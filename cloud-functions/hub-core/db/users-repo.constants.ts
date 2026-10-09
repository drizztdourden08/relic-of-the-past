/* @layer hub-core @kind constants */
import type { AccessState } from '../../../shared/hub';

const ACCESS_STATES: readonly AccessState[] = ['admin', 'member', 'pending', 'revoked'];

export { ACCESS_STATES };

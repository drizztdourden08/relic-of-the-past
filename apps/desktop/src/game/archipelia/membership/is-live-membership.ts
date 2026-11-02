/* @layer bridge-wasm @kind logic */
import { LIVE_KINDS } from './membership.constants';
import type { ArchipeliaMembership } from './membership.type';

const isLiveMembership = (membership: ArchipeliaMembership): boolean => LIVE_KINDS.includes(membership.state.kind);

export { isLiveMembership };

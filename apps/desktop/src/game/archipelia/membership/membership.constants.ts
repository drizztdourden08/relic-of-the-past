/* @layer bridge-wasm @kind constants */
import type { GoneReason, MembershipState } from './membership.type';

const MEMBERSHIP_KEY = 'archipelia';

const WAITING_KINDS: readonly MembershipState['kind'][] = ['pending', 'approved', 'failed'];

const GONE_CODES: Readonly<Record<string, GoneReason>> = {
  'lobby-closed': 'closed',
  'lobby-not-found': 'not-found',
  'resume-invalid': 'resume-invalid',
};

export { GONE_CODES, MEMBERSHIP_KEY, WAITING_KINDS };

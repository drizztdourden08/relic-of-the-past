/* @layer root-config @kind logic */
import type { AccessRule } from '../access-rule.type';

const manualGrant: AccessRule = async ({ grant }) => (grant && !grant.revoked ? 'manual-grant' : null);

export { manualGrant };

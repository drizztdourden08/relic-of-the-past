/* @layer hub-core @kind types */
import type { AccessGrant } from '@rotp/hub-contracts';

type GrantDoc = AccessGrant & { revoked: boolean };

export type { GrantDoc };

/* @layer hub-core @kind types */
import type { AccessGrant } from '../../../shared/hub';

type GrantDoc = AccessGrant & { revoked: boolean };

export type { GrantDoc };

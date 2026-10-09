/* @layer hub-core @kind types */
import type { AccessCheck } from '@rotp/hub-contracts';

type AccessResult = { access: AccessCheck; roleGroupIds: string[] };

export type { AccessResult };

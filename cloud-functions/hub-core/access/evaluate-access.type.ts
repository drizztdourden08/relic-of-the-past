/* @layer hub-core @kind types */
import type { AccessCheck } from '../../../shared/hub';

type AccessResult = { access: AccessCheck; roleGroupIds: string[] };

export type { AccessResult };

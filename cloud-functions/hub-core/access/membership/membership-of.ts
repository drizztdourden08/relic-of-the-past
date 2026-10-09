/* @layer hub-core @kind logic */
import type { HubUser } from '../../../../shared/hub';

const membershipOf = (user: HubUser): string[] => Array.from(new Set([...user.groupIds, ...user.roleGroupIds]));

export { membershipOf };

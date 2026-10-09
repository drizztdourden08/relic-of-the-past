/* @layer store-api @kind logic */
import type { Person } from '../../../../../shared/store/types';
import type { Player } from './player.type';

const personOf = ({ caller, user }: Player): Person => ({ userId: caller.userId, displayName: user.displayName });

export { personOf };

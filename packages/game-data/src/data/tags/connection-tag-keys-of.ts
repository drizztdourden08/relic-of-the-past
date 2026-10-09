/* @layer shared-game @kind logic */
import type { ConnectionTag } from '../taxonomy/connection-tags.generated.type';
import { tagKeysOf } from './tag-keys-of';

const connectionTagKeysOf = (ids: readonly string[]): readonly ConnectionTag[] =>
  tagKeysOf(ids) as readonly ConnectionTag[];

export { connectionTagKeysOf };

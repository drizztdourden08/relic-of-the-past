/* @layer shared-game @kind logic */
import type { ContentTag } from '../taxonomy/check-content-tags.generated.type';
import { tagKeysOf } from './tag-keys-of';

const checkTagKeysOf = (ids: readonly string[]): readonly ContentTag[] =>
  tagKeysOf(ids) as readonly ContentTag[];

export { checkTagKeysOf };

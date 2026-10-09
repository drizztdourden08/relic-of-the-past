/* @layer shared-game @kind logic */
import type { ScreenTag } from '../taxonomy/screen-tags';
import { tagKeysOf } from './tag-keys-of';

const screenTagKeysOf = (ids: readonly string[]): readonly ScreenTag[] =>
  tagKeysOf(ids) as readonly ScreenTag[];

export { screenTagKeysOf };

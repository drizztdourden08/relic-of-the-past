/* @layer renderer-widgets @kind logic */
import type { ConnectionInfo } from '@rotp/game-core';
import type { ScreenBundleGrid } from '@rotp/game-data';

const sourceSlotOf = (bundle: ScreenBundleGrid, c: ConnectionInfo): number =>
  (c.sourceScreen === undefined ? -1 : bundle.screens.indexOf(c.sourceScreen));

export { sourceSlotOf };

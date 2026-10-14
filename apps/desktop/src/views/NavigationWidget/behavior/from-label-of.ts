/* @layer renderer-widgets @kind logic */
import type { ScreenBundleGrid } from '@rotp/game-data';

const fromLabelOf = (screenBundle: ScreenBundleGrid | null, sourceScreen: number): string =>
  (screenBundle?.isMulti ? ` (${screenBundle.subNames[sourceScreen] ?? ''})` : '');

export { fromLabelOf };

/* @layer website-site @kind logic */
import type { Screenshot } from '../../../../../features';
import type { Extent } from './frame-style-of.type';

const extentOf = (shots: readonly Screenshot[]): Extent => ({
  width: Math.max(...shots.map((shot) => shot.width)),
  height: Math.max(...shots.map((shot) => shot.height)),
});

export { extentOf };

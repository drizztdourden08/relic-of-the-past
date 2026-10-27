/* @layer website-site @kind logic */
import type { CSSProperties } from 'react';
import type { Screenshot } from '../../../../../features';
import type { Extent } from './frame-style-of.type';

const frameStyleOf = (shot: Screenshot, extent: Extent): CSSProperties => ({
  width: `${(shot.width / extent.width) * 100}%`,
  height: `${(shot.height / extent.height) * 100}%`,
});

export { frameStyleOf };

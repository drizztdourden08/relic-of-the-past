/* @layer website-site @kind logic */
import type { CSSProperties } from 'react';
import type { Frame } from '../../../../../features';

const frameStyleOf = ({ x, y, width, height }: Frame): CSSProperties => ({
  left: `${x}%`,
  top: `${y}%`,
  width: `${width}%`,
  height: `${height}%`,
});

export { frameStyleOf };

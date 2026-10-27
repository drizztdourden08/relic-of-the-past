/* @layer website-site @kind logic */
import type { CSSProperties } from 'react';

const ringStyleOf = ({ x, y }: { x: number; y: number }): CSSProperties => ({
  left: `${x * 100}%`,
  top: `${y * 100}%`,
});

export { ringStyleOf };

/* @layer renderer-components @kind logic */
import type { MsuLayer } from '@rotp/game-data';

const filesOf = (layers: MsuLayer[]): string[] => [...new Set(layers.flatMap((layer) => layer.files))];

export { filesOf };

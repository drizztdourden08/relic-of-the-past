/* @layer renderer-components @kind logic */
import type { MsuLayer } from '@shared/types/msu-manifest';

const filesOf = (layers: MsuLayer[]): string[] => [...new Set(layers.flatMap((layer) => layer.files))];

export { filesOf };

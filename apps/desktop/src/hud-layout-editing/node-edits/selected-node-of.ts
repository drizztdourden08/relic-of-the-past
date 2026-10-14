/* @layer renderer-components @kind logic */
import { nodeById } from './node-by-id';
import type { HudLayout, HudNode } from '@rotp/hud';

const selectedNodeOf = (doc: HudLayout | null, id: string | null): HudNode | null =>
  (doc && id ? nodeById(doc, id) : null);

export { selectedNodeOf };

/* @layer renderer-components @kind logic */
import type { HudNode } from '@shared/types/hud';

const childrenOf = (node: HudNode): readonly HudNode[] => (node.kind === 'container' ? node.children : []);

export { childrenOf };

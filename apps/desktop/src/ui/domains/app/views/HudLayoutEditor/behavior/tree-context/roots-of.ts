/* @layer renderer-components @kind logic */
import type { HudLayout, HudNode } from '@rotp/hud';

const rootsOf = (doc: HudLayout): readonly HudNode[] => [doc.screen];

export { rootsOf };

/* @layer tests @kind helper */
import type { HudGridContainer, HudLayout } from '@rotp/hud';
import { centreDocOf } from '../centre-doc-of';

const docOf = (root: HudGridContainer): HudLayout => centreDocOf(root, 'phase7', 'Phase 7');

export { docOf };

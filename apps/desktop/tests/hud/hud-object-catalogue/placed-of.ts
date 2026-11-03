/* @layer test @kind helper */
import { layoutHud } from '@rotp/hud';
import type { HudNode } from '@rotp/hud';
import { centreDocOf } from '../centre-doc-of';
import { row } from './row';

const view = { w: 400, h: 200 };

const placedOf = (root: HudNode, scope: Record<string, number>) =>
  layoutHud(centreDocOf(row([root]), 'test', 'Test'), view, { scope });

export { placedOf };

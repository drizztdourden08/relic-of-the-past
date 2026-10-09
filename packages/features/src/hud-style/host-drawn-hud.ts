/* @layer shared-features @kind logic */
import type { HudStyle } from './hud-style.type';

const hostDrawnHud = (style: HudStyle): boolean => style !== 'vanilla';

export { hostDrawnHud };

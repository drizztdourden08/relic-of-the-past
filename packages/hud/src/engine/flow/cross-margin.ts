/* @layer shared-hud @kind logic */
import type { Insets } from './flow.type';

const crossMargin = (m: Insets, row: boolean): number => (row ? m.top + m.bottom : m.left + m.right);

export { crossMargin };

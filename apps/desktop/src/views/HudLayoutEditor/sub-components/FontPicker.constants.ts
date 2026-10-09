/* @layer renderer-components @kind constants */
import type { HudFontFamily } from '@rotp/hud';

const GAME_DESIGN_SIZE = 16;

const FONT_VARS: Readonly<Record<HudFontFamily, string>> = {
  game: 'var(--font-game)', sans: 'var(--font-sans)', mono: 'var(--font-mono)',
};

const FAMILIES: readonly { value: HudFontFamily; label: string }[] = [
  { value: 'game', label: 'ALttP Dialogue' },
  { value: 'sans', label: 'UI sans' },
  { value: 'mono', label: 'UI mono' },
];

export { FAMILIES, FONT_VARS, GAME_DESIGN_SIZE };

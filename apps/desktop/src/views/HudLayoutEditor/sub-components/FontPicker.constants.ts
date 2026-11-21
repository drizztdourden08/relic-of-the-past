/* @layer renderer-components @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { Message } from '@drizztdourden08/brock-core/i18n';
import type { HudFontFamily } from '@rotp/hud';

const GAME_DESIGN_SIZE = 16;

const FONT_VARS: Readonly<Record<HudFontFamily, string>> = {
  game: 'var(--font-game)', sans: 'var(--font-sans)', mono: 'var(--font-mono)',
};

const FAMILIES: readonly { value: HudFontFamily; label: Message }[] = [
  { value: 'game', label: msg('hud-editor:font.game') },
  { value: 'sans', label: msg('hud-editor:font.sans') },
  { value: 'mono', label: msg('hud-editor:font.mono') },
];

export { FAMILIES, FONT_VARS, GAME_DESIGN_SIZE };

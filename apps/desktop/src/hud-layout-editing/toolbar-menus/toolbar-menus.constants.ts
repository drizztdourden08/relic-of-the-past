/* @layer renderer-components @kind constants */
import gridIcon from '@iconify-icons/lucide/grid-3x3';
import layoutIcon from '@iconify-icons/lucide/layout';
import layoutTemplateIcon from '@iconify-icons/lucide/layout-template';
import moveHorizontalIcon from '@iconify-icons/lucide/move-horizontal';
import zapIcon from '@iconify-icons/lucide/zap';
import gamepadIcon from '@iconify-icons/lucide/gamepad-2';
import squareDotIcon from '@iconify-icons/lucide/square-dot';
import imageIcon from '@iconify-icons/lucide/image';
import magnetIcon from '@iconify-icons/lucide/magnet';
import { SDL_BUTTON } from '@rotp/game-data';

const GLYPH_POSITIONS: readonly string[] = ['DPAD', ...Object.keys(SDL_BUTTON)];

const TOOLBAR_ICONS = {
  container: layoutIcon,
  glyph: gamepadIcon,
  slot: squareDotIcon,
  sprite: imageIcon,
  spacer: moveHorizontalIcon,
  dynamics: zapIcon,
  preset: layoutTemplateIcon,
  gridView: gridIcon,
  snapping: magnetIcon,
} as const;

export { GLYPH_POSITIONS, TOOLBAR_ICONS };

/* @layer shared-hud @kind constants */
import type { HudAlignSelf } from '../../types/hud-node';

const COMMENT_KEY = '$comment';

const EDGE_KEYS = ['top', 'right', 'bottom', 'left'] as const;

const ALIGN_SELF: readonly HudAlignSelf[] = ['start', 'center', 'end', 'stretch'];

const BOX_KEYS = [
  'id', 'size', 'min', 'max', 'margin', 'padding', 'scale', 'opacity', 'visible', 'dimWhenEmpty',
  'place', 'order', 'alignSelf', 'justifySelf', 'style', 'animation', 'transition',
] as const;

export { ALIGN_SELF, BOX_KEYS, COMMENT_KEY, EDGE_KEYS };

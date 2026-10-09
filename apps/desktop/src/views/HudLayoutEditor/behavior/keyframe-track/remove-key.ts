/* @layer renderer-components @kind logic */
import { canRemoveKey } from './can-remove-key';
import type { HudAnimationKeyframe } from '@rotp/hud';

const removeKey = (
  keyframes: readonly HudAnimationKeyframe[], index: number,
): HudAnimationKeyframe[] =>
  (canRemoveKey(keyframes) ? keyframes.filter((_unused, i) => i !== index) : [...keyframes]);

export { removeKey };

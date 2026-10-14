/* @layer renderer-hud @kind logic */
import type { HudEnterExitTransition } from '@rotp/hud';

const transitionDuration = (spec: HudEnterExitTransition | undefined): number =>
  (typeof spec?.duration === 'number' ? spec.duration : 0);

export { transitionDuration };

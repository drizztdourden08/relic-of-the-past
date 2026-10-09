/* @layer renderer-components @kind logic */
import { DEFAULT_DURATION } from './transition-edits.constants';
import type { HudTransition } from '@rotp/hud';

const mergeTransition = (
  transition: HudTransition | undefined, patch: Partial<HudTransition>,
): HudTransition | undefined => {
  const next: HudTransition = {
    properties: transition?.properties ?? [],
    duration: transition?.duration ?? DEFAULT_DURATION,
    ...(transition?.easing !== undefined ? { easing: transition.easing } : {}),
    ...(transition?.when !== undefined ? { when: transition.when } : {}),
    ...(transition?.enter !== undefined ? { enter: transition.enter } : {}),
    ...(transition?.exit !== undefined ? { exit: transition.exit } : {}),
    ...patch,
  };
  if (next.easing === undefined) delete next.easing;
  if (next.when === undefined) delete next.when;
  if (next.enter === undefined) delete next.enter;
  if (next.exit === undefined) delete next.exit;
  const empty = next.properties.length === 0 && next.enter === undefined && next.exit === undefined;
  return empty ? undefined : next;
};

export { mergeTransition };

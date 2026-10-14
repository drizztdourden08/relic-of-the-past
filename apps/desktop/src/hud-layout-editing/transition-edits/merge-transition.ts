/* @layer renderer-components @kind logic */
import { DEFAULT_DURATION } from './transition-edits.constants';
import type { HudTransition } from '@rotp/hud';

const withoutUnset = (transition: HudTransition): HudTransition => {
  const { easing, when, enter, exit, ...required } = transition;
  return {
    ...required,
    ...(easing === undefined ? {} : { easing }),
    ...(when === undefined ? {} : { when }),
    ...(enter === undefined ? {} : { enter }),
    ...(exit === undefined ? {} : { exit }),
  };
};

const mergeTransition = (
  transition: HudTransition | undefined, patch: Partial<HudTransition>,
): HudTransition | undefined => {
  const next = withoutUnset({
    ...transition,
    properties: transition?.properties ?? [],
    duration: transition?.duration ?? DEFAULT_DURATION,
    ...patch,
  });
  const empty = next.properties.length === 0 && next.enter === undefined && next.exit === undefined;
  return empty ? undefined : next;
};

export { mergeTransition };

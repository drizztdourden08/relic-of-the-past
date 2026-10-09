/* @layer shared-input @kind logic */
import { DEFAULT_TRIGGER_PRESS_THRESHOLD } from '../live-control-state.constants';
import type { DisplayContext } from './resolve-display.type';

const resolveTriggerPressThreshold = (ctx: DisplayContext): number => {
  return ctx.override?.triggerPressThreshold
    ?? ctx.family.triggerPressThreshold
    ?? ctx.generic.triggerPressThreshold
    ?? DEFAULT_TRIGGER_PRESS_THRESHOLD;
};

export { resolveTriggerPressThreshold };

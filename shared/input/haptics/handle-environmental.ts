/* @layer shared-input @kind logic */
import { getEnvironmentalPatternId } from '../haptic-events';
import { firePattern } from './fire-pattern';
import { hapticState } from './haptic-state';

const handleEnvironmental = (subEvent: number): void => {
  const { settings } = hapticState;
  if (!settings.enabled || !settings.environmentalEffects || !hapticState.vibrateFn) return;
  const id = getEnvironmentalPatternId(subEvent);
  if (id) firePattern(id);
};

export { handleEnvironmental };

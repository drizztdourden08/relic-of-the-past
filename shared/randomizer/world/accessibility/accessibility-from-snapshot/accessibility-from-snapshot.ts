/* @layer shared-game @kind logic */
import { ACCESSIBILITY_KEY, DEFAULT_ACCESSIBILITY, KNOWN_ACCESSIBILITY_MODES } from './accessibility-from-snapshot.constants';
import type { AccessibilityMode } from '../accessibility.type';
import type { RandomizerOptionsSnapshot } from '../../options.type';

const accessibilityFromSnapshot = (snapshot: RandomizerOptionsSnapshot): AccessibilityMode => {
  const raw = snapshot.values[ACCESSIBILITY_KEY];
  return typeof raw === 'string' && KNOWN_ACCESSIBILITY_MODES.has(raw) ? raw as AccessibilityMode : DEFAULT_ACCESSIBILITY;
};

export { accessibilityFromSnapshot };

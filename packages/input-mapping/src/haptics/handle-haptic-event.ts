/* @layer shared-input @kind logic */
import { firePattern } from './fire-pattern';
import { HAPTIC_ROUTES } from './haptic-routes.constants';
import { hapticState } from './haptic-state';

const handleHapticEvent = (eventType: number, param: number): void => {
  const { settings } = hapticState;
  if (!settings.enabled || !hapticState.vibrateFn) return;

  const route = HAPTIC_ROUTES[eventType];
  if (!route || !settings[route.setting]) return;
  const id = route.pattern(param);
  if (id) firePattern(id);
};

export { handleHapticEvent };

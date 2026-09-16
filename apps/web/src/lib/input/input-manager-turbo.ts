/* @layer renderer-lib @kind logic */
/**
 * Registers the turbo shortcut as a hold: the rising edge engages it and the falling edge lets go,
 * from keyboard and gamepad alike. Same rebindable mechanism as the other function actions. The
 * setting is checked on press, so a profile with turbo off never engages it; the core additionally
 * refuses to leave real time while its configured speed is 100 (pushTurboSpeed), belt and braces.
 *
 * A hold can lose its release: input gets suppressed while a menu is open, and the window can lose
 * focus mid-hold. Both paths release turbo explicitly so the game never stays fast on its own.
 */
import { liveSettingsNow } from '@app/lib/game/live-settings';
import { setTurboHeld } from '@app/lib/game/turbo';
import type { InputManager } from './input-manager';

const wireTurboAction = (m: InputManager): void => {
  m.functionActions.onAction('turbo', () => {
    if (!liveSettingsNow()?.turboEnabled) return;
    setTurboHeld(true);
  });
  m.functionActions.onKeyUp((action) => {
    if (action === 'turbo') setTurboHeld(false);
  });
  if (typeof window !== 'undefined') {
    window.addEventListener('blur', () => setTurboHeld(false));
  }
};

export { wireTurboAction };

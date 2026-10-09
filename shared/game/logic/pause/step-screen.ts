/* @layer shared-game @kind logic */
import type { PauseScreen } from './pause.type';
import { SCREEN_ORDER } from './screens.constants';

const stepScreen = (screen: PauseScreen, dir: 'prev' | 'next'): PauseScreen => {
  const at = SCREEN_ORDER.indexOf(screen);
  const next = (at + (dir === 'next' ? 1 : -1) + SCREEN_ORDER.length) % SCREEN_ORDER.length;
  return SCREEN_ORDER[next];
};

export { stepScreen };

/* @layer shared-game @kind logic */
import type { PauseScreen, PauseSection } from './pause.type';
import { SCREEN_SECTIONS } from './screens.constants';

const firstSectionOf = (screen: PauseScreen): PauseSection => {
  const [first] = SCREEN_SECTIONS[screen];
  if (first === undefined) throw new Error(`pause screen ${screen} has no sections`);
  return first;
};

export { firstSectionOf };

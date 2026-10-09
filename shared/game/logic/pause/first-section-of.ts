/* @layer shared-game @kind logic */
import type { PauseScreen, PauseSection } from './pause.type';
import { SCREEN_SECTIONS } from './screens.constants';

const firstSectionOf = (screen: PauseScreen): PauseSection => SCREEN_SECTIONS[screen][0];

export { firstSectionOf };

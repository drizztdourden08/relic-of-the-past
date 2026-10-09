/* @layer shared-game @kind logic */
import type { PauseScreen, PauseSection } from './pause.type';
import { SCREEN_SECTIONS } from './screens.constants';

const sectionsOf = (screen: PauseScreen): readonly PauseSection[] => SCREEN_SECTIONS[screen];

export { sectionsOf };

/* @layer renderer-widgets @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { GameUIState } from '@rotp/game-data';
import type { StateSectionData } from '../DebugWidget.type';
import { playerSections } from './player-sections';
import { systemSections } from './system-sections';
import { worldSections } from './world-sections';

const buildStateSections = (t: I18n['t'], text: I18n['text'], state: GameUIState, fps?: number): StateSectionData[] => [
  ...worldSections(t, state, fps),
  ...playerSections(t, text, state),
  ...systemSections(t, state),
];

export { buildStateSections };

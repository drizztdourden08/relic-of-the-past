/* @layer renderer-widgets @kind logic */
import type { GameUIState } from '@rotp/game-data';
import type { StateSectionData } from '../DebugWidget.type';
import { playerSections } from './player-sections';
import { systemSections } from './system-sections';
import { worldSections } from './world-sections';

const buildStateSections = (state: GameUIState, fps?: number): StateSectionData[] => [
  ...worldSections(state, fps),
  ...playerSections(state),
  ...systemSections(state),
];

export { buildStateSections };

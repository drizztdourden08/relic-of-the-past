/* @layer renderer-widgets @kind logic */
import type { GameUIState } from '@rotp/game-data';
import type { StateSectionData } from '../DebugWidget.type';
import { hex } from './hex';
import { yn } from './yes-no';

const worldSections = (state: GameUIState, fps?: number): StateSectionData[] => {
  const { mode, gameMode, map } = state;
  return [
    { title: 'Mode', rows: [
      { label: 'UI Mode', value: String(mode) },
      { label: 'Module / Sub / SubSub', value: `${gameMode.mainModule} / ${gameMode.subModule} / ${gameMode.subSubModule}`, mono: true },
      ...(fps !== undefined ? [{ label: 'FPS', value: String(fps) }] : []),
    ] },
    { title: 'Location', rows: [
      { label: 'World', value: map.isDarkWorld ? 'Dark' : 'Light' },
      { label: 'Indoors', value: yn(map.isIndoors) },
      { label: 'OW Screen / Area', value: `${map.overworldScreenIndex} / ${map.overworldAreaIndex}` },
      { label: 'Room', value: hex(map.roomIndex, 3), mono: true },
      { label: 'Palace', value: map.palaceIndex === 0xff ? '-' : String(map.palaceIndex >> 1) },
      { label: 'Entrance', value: hex(map.whichEntrance), mono: true },
      { label: 'Floor', value: String(map.currentFloor) },
      { label: 'Layer', value: map.linkLayer === 0 ? 'Upper' : 'Lower' },
      { label: 'Player X / Y', value: `${map.linkX}, ${map.linkY}`, mono: true },
    ] },
  ];
};

export { worldSections };

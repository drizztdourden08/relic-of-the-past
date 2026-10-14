/* @layer renderer-widgets @kind logic */
import type { GameUIState } from '@rotp/game-data';
import type { StateSectionData } from '../DebugWidget.type';
import { yn } from './yes-no';

const systemSections = (state: GameUIState): StateSectionData[] => {
  const { text, map, floorIndicator, countdown, saveMenu } = state;
  return [
    { title: 'Text', rows: [
      { label: 'Active', value: yn(text.isActive) },
      { label: 'Message #', value: String(text.messageId) },
      { label: 'Phase', value: String(text.renderPhase) },
      { label: 'Incr / Choice / Wait', value: `${text.incrementalState} / ${text.choice} / ${text.waitTimer}`, mono: true },
    ] },
    { title: 'Map Menu', rows: [
      { label: 'Overworld State', value: String(map.overworldMapState) },
      { label: 'Dungeon Idx', value: String(map.dungeonIdx) },
      { label: 'Dungeon Floor', value: String(map.dungeonFloor) },
      { label: 'Init State', value: String(map.dungeonInitState) },
    ] },
    { title: 'Floor Indicator', rows: [
      { label: 'Visible', value: yn(floorIndicator.isVisible) },
      { label: 'Timer', value: String(floorIndicator.timer) },
      { label: 'Floor', value: String(floorIndicator.floor) },
    ] },
    { title: 'Countdown', rows: [
      { label: 'Running', value: yn(countdown.isRunning) },
      { label: 'Seconds', value: String(countdown.seconds) },
      { label: 'Frames', value: String(countdown.frames) },
    ] },
    { title: 'Save Menu', rows: [
      { label: 'Cursor', value: String(saveMenu.cursorPosition) },
      { label: 'From Module', value: String(saveMenu.sourceModule) },
      { label: 'Progress', value: String(saveMenu.progressIndicator) },
    ] },
  ];
};

export { systemSections };

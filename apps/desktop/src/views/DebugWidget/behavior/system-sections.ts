/* @layer renderer-widgets @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { GameUIState } from '@rotp/game-data';
import type { StateSectionData } from '../DebugWidget.type';
import { yn } from './yes-no';

const systemSections = (t: I18n['t'], state: GameUIState): StateSectionData[] => {
  const { text, map, floorIndicator, countdown, saveMenu } = state;
  return [
    { title: t('views-debug:section.text'), rows: [
      { label: t('views-debug:row.active'), value: yn(t, text.isActive) },
      { label: t('views-debug:row.message.id'), value: String(text.messageId) },
      { label: t('views-debug:row.phase'), value: String(text.renderPhase) },
      { label: t('views-debug:row.incremental.choice.wait'), value: `${text.incrementalState} / ${text.choice} / ${text.waitTimer}`, mono: true },
    ] },
    { title: t('views-debug:section.map.menu'), rows: [
      { label: t('views-debug:row.overworld.state'), value: String(map.overworldMapState) },
      { label: t('views-debug:row.dungeon.index'), value: String(map.dungeonIdx) },
      { label: t('views-debug:row.dungeon.floor'), value: String(map.dungeonFloor) },
      { label: t('views-debug:row.init.state'), value: String(map.dungeonInitState) },
    ] },
    { title: t('views-debug:section.floor.indicator'), rows: [
      { label: t('views-debug:row.visible'), value: yn(t, floorIndicator.isVisible) },
      { label: t('views-debug:row.timer'), value: String(floorIndicator.timer) },
      { label: t('views-debug:row.floor'), value: String(floorIndicator.floor) },
    ] },
    { title: t('views-debug:section.countdown'), rows: [
      { label: t('views-debug:row.running'), value: yn(t, countdown.isRunning) },
      { label: t('views-debug:row.seconds'), value: String(countdown.seconds) },
      { label: t('views-debug:row.frames'), value: String(countdown.frames) },
    ] },
    { title: t('views-debug:section.save.menu'), rows: [
      { label: t('views-debug:row.cursor'), value: String(saveMenu.cursorPosition) },
      { label: t('views-debug:row.from.module'), value: String(saveMenu.sourceModule) },
      { label: t('views-debug:row.progress'), value: String(saveMenu.progressIndicator) },
    ] },
  ];
};

export { systemSections };

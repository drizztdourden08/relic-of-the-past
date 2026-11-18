/* @layer renderer-widgets @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { GameUIState } from '@rotp/game-data';
import type { StateSectionData } from '../DebugWidget.type';
import { hex } from './hex';
import { yn } from './yes-no';

const worldSections = (t: I18n['t'], state: GameUIState, fps?: number): StateSectionData[] => {
  const { mode, gameMode, map } = state;
  return [
    { title: t('views-debug:section.mode'), rows: [
      { label: t('views-debug:row.ui.mode'), value: String(mode) },
      { label: t('views-debug:row.module.sub'), value: `${gameMode.mainModule} / ${gameMode.subModule} / ${gameMode.subSubModule}`, mono: true },
      ...(fps !== undefined ? [{ label: t('views-debug:row.fps'), value: String(fps) }] : []),
    ] },
    { title: t('views-debug:section.location'), rows: [
      { label: t('views-debug:row.world'), value: map.isDarkWorld ? t('views-debug:value.dark') : t('views-debug:value.light') },
      { label: t('views-debug:row.indoors'), value: yn(t, map.isIndoors) },
      { label: t('views-debug:row.ow.screen.area'), value: `${map.overworldScreenIndex} / ${map.overworldAreaIndex}` },
      { label: t('views-debug:row.room'), value: hex(map.roomIndex, 3), mono: true },
      { label: t('views-debug:row.palace'), value: map.palaceIndex === 0xff ? '-' : String(map.palaceIndex >> 1) },
      { label: t('views-debug:row.entrance'), value: hex(map.whichEntrance), mono: true },
      { label: t('views-debug:row.floor'), value: String(map.currentFloor) },
      { label: t('views-debug:row.layer'), value: map.linkLayer === 0 ? t('views-debug:value.upper') : t('views-debug:value.lower') },
      { label: t('views-debug:row.player.xy'), value: `${map.linkX}, ${map.linkY}`, mono: true },
    ] },
  ];
};

export { worldSections };

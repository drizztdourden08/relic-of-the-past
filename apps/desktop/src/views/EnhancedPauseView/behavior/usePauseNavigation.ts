/* @layer renderer-hud @kind hook */
import { useControlSchemeStore } from '@app/stores/control-scheme-store';
import { usePauseMenuStore } from '@app/stores/pause-menu-store';
import type { PauseNavigation } from '../EnhancedPauseView.type';
import { useGearModel } from './useGearModel';
import { useItemModel } from './useItemModel';
import { useLegendEntries } from './useLegendEntries';
import { usePauseAssign } from './usePauseAssign';
import { usePauseCursor } from './usePauseCursor';
import { useStatusModel } from './useStatusModel';
import { useVisibleBrowsing } from './useVisibleBrowsing';

const usePauseNavigation = (packId: string): PauseNavigation => {
  const state = usePauseMenuStore((s) => s.state);
  const canConfirm = usePauseMenuStore((s) => s.canConfirm);
  const bindings = useControlSchemeStore((s) => s.bindings);

  const visible = useVisibleBrowsing(state, canConfirm);
  const { screen, section, cursor } = visible;

  const items = useItemModel(section === 'bottles' ? 'bottles' : 'items', cursor);
  const gear = useGearModel();
  const dungeonItems = useStatusModel();
  const { assign, hintLines } = usePauseAssign(screen, section);
  const move = usePauseCursor();
  const legend = useLegendEntries(bindings, packId, visible.canConfirm);

  return { screen, section, cursor, items, gear, dungeonItems, hintLines, assign, move, legend };
};

export { usePauseNavigation };

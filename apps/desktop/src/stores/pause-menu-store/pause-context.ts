/* @layer renderer-stores @kind logic */
import type { PauseContext } from '@rotp/game-data';
import { arrowTypeOf, buildItemCells } from '@rotp/game-data';
import { ownedMax } from '@app/lib/game/gear-ownership';
import { wantedActiveItem } from '@app/lib/game/host-menu';
import { useGameUIStore } from '../game-ui-store';

const pauseContext = (): PauseContext => {
  const ui = useGameUIStore.getState();
  const cells = buildItemCells(ui.inventory.items, ui.inventory.bottles);
  return {
    owned: cells.map((cell) => cell.owned),
    bottles: ui.inventory.bottles,
    gear: {
      sword: ui.equipment.sword,
      shield: ui.equipment.shield,
      mail: ui.equipment.armor,
      bow: arrowTypeOf(ui.inventory.items[0] ?? 0),
    },
    ownedMax: ownedMax(),
    activeItem: wantedActiveItem() || ui.hostMenu.activeItem,
  };
};

export { pauseContext };

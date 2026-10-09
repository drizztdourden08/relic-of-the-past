/* @layer bridge-wasm @kind logic */
import { log } from '../../log-bus';
import { setDungeonItemGrantsActive } from '../live-settings-flags';
import { reassertGateWord3 } from '../live-settings';

const armDungeonItemGrants = (): void => {
  setDungeonItemGrantsActive(true);
  reassertGateWord3();
  log.randomizer('[Randomizer] Dungeon item grants armed: an assigned key or map credits its own dungeon');
};

export { armDungeonItemGrants };

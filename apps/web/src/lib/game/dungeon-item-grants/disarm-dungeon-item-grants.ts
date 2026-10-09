/* @layer bridge-wasm @kind logic */
import { setDungeonItemGrantsActive } from '../live-settings-flags';
import { reassertGateWord3 } from '../live-settings';

const disarmDungeonItemGrants = (): void => {
  setDungeonItemGrantsActive(false);
  reassertGateWord3();
};

export { disarmDungeonItemGrants };

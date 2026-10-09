/* @layer bridge-wasm @kind logic */
import { setDungeonItemGrantsActive } from '@rotp/game-core';
import { reassertGateWord3 } from '@rotp/game-core';

const disarmDungeonItemGrants = (): void => {
  setDungeonItemGrantsActive(false);
  reassertGateWord3();
};

export { disarmDungeonItemGrants };

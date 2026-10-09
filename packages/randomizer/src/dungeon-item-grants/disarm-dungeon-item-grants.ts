/* @layer bridge-wasm @kind logic */
import { setDungeonItemGrantsActive, reassertGateWord3 } from '@rotp/game-core';

const disarmDungeonItemGrants = (): void => {
  setDungeonItemGrantsActive(false);
  reassertGateWord3();
};

export { disarmDungeonItemGrants };

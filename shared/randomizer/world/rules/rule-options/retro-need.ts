/* @layer shared-game @kind logic */
import type { retroWalletNeed } from '../../retro/retro-wallet-need';
import type { World } from '../../world.type';

const retroNeed = (world: World, need: typeof retroWalletNeed): number => {
  const retro = world.options.retroBow;
  return retro === undefined ? 0 : need(retro);
};

export { retroNeed };

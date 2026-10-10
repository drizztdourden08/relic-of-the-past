/* @layer tests @kind helper */
import { open } from './open';
import type { Rig } from './hud-layout-options.type';

const rigSlot = () => {
  let current: Rig | undefined;
  const currentRig = (): Rig => {
    if (current === undefined) throw new Error('the HUD layout rig is not open');
    return current;
  };
  const openRig = async (): Promise<void> => { current = await open(); };
  const closeRig = async (): Promise<void> => { await current?.close(); };
  return { currentRig, openRig, closeRig };
};

export { rigSlot };

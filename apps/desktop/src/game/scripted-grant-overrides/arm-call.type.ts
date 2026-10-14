/* @layer bridge-wasm @kind types */
import type { LiveModule, SingleArmSurface } from '@rotp/randomizer';

type ArmCallParams = {
  mod: LiveModule;
  target: SingleArmSurface;
  newItem: number;
  messageId: number;
  fireId: number;
};

export type { ArmCallParams };

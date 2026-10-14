/* @layer bridge-wasm @kind logic */
import { createGameCore } from '@drizztdourden08/brock-port-kit/renderer';
import { CRASH_ARM_DELAY_MS, rotpPort } from '../port';
import { precompiledCore } from '../wasm-warmup';
import { handleCoreCrash } from './handle-core-crash';

const rotpCore = createGameCore(rotpPort, {
  precompiled: precompiledCore,
  crashArmDelayMs: CRASH_ARM_DELAY_MS,
  onCrash: handleCoreCrash,
});

export { rotpCore };

/* @layer bridge-wasm @kind logic */
import { createCoreCalls } from '@drizztdourden08/brock-port-kit/renderer';
import type { EmscriptenModule as PortModule } from '@drizztdourden08/brock-port-kit/renderer';
import type { CoreCalls } from '@drizztdourden08/brock-port-kit';
import { getModule } from '@rotp/game-core';
import { isGameModule } from '../lifecycle/is-game-module';

const isPortModule = (value: unknown): value is PortModule => isGameModule(value);

const currentCoreCalls = (): CoreCalls | null => {
  const mod = getModule();
  return isPortModule(mod) ? createCoreCalls(mod) : null;
};

export { currentCoreCalls };

/* @layer bridge-wasm @kind logic */
import { registerSessionFactory } from '@drizztdourden08/brock-randomizer/session';
import { installBridge } from './install-bridge';
import { rotpLocalFactory } from './rotp-local-factory';

const registerRotpFactories = (): void => {
  installBridge();
  registerSessionFactory(rotpLocalFactory());
};

export { registerRotpFactories };

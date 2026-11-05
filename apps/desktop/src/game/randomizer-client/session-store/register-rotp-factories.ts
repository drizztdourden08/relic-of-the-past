/* @layer bridge-wasm @kind logic */
import { registerSessionFactory } from '@drizztdourden08/brock-randomizer/session';
import { rotpLocalFactory } from './rotp-local-factory';
import { rotpOnlineFactory } from './rotp-online-factory';

const registerRotpFactories = (): void => {
  registerSessionFactory(rotpLocalFactory());
  registerSessionFactory(rotpOnlineFactory);
};

export { registerRotpFactories };

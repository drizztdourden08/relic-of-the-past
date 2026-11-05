/* @layer bridge-wasm @kind logic */
import { createLocalSessionFactory } from '@drizztdourden08/brock-randomizer/session';
import type { SessionFactory } from '@drizztdourden08/brock-randomizer/session';
import { rotpRandomizer } from '@app/randomizer/rotp-randomizer';
import { installBridge } from './install-bridge';
import { localWithStats } from './local-with-stats';

const rotpLocalFactory = (): SessionFactory => {
  const base = createLocalSessionFactory(rotpRandomizer);
  return {
    ...base,
    create: (pending) => {
      installBridge();
      return localWithStats(base.create(pending));
    },
  };
};

export { rotpLocalFactory };

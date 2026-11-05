/* @layer bridge-wasm @kind logic */
import { createLocalSessionFactory } from '@drizztdourden08/brock-randomizer/renderer';
import type { SessionFactory } from '@drizztdourden08/brock-randomizer/session';
import { rotpRandomizer } from '@app/randomizer/rotp-randomizer';
import { rotpLog } from '@app/randomizer/rotp-randomizer/rotp-log';
import { installBridge } from './install-bridge';
import { localWithStats } from './local-with-stats';

const rotpLocalFactory = (): SessionFactory => {
  const base = createLocalSessionFactory(rotpRandomizer, rotpLog);
  return {
    ...base,
    create: (pending) => {
      installBridge();
      return localWithStats(base.create(pending));
    },
  };
};

export { rotpLocalFactory };

/* @layer bridge-wasm @kind logic */
import type { RandomizerSession } from '@drizztdourden08/brock-randomizer/session';
import type { LocalSession } from '@rotp/randomizer';
import { localStats } from './local-stats';
import { NO_REPORTED } from './local-with-stats.constants';

const localWithStats = (base: RandomizerSession): LocalSession => ({
  kind: 'local',
  get status() { return base.status; },
  get stats() { return localStats.current; },
  start: () => base.start(),
  stop: () => base.stop(),
  reportCheck: (key) => base.reportCheck(key),
  reported: () => base.reported?.() ?? NO_REPORTED,
});

export { localWithStats };

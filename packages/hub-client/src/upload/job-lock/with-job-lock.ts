/* @layer site-kit @kind logic */
import { optionalLockManager } from '../browser-apis';
import { lockName } from './lock-name';

const withJobLock = async (id: string, run: () => Promise<void>): Promise<boolean> => {
  const locks = optionalLockManager();
  if (!locks?.request) {
    await run();
    return true;
  }
  return locks.request(lockName(id), { ifAvailable: true }, async (lock) => {
    if (!lock) return false;
    await run();
    return true;
  });
};

export { withJobLock };

/* @layer site-kit @kind logic */
import { lockName } from './lock-name';

const withJobLock = async (id: string, run: () => Promise<void>): Promise<boolean> => {
  if (!navigator.locks?.request) {
    await run();
    return true;
  }
  return navigator.locks.request(lockName(id), { ifAvailable: true }, async (lock) => {
    if (!lock) return false;
    await run();
    return true;
  });
};

export { withJobLock };

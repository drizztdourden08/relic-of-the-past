/* @layer site-kit @kind logic */
import { optionalLockManager } from '../browser-apis';
import { lockName } from './lock-name';

const heldLocks = async (): Promise<Set<string>> => {
  const locks = optionalLockManager();
  if (!locks?.query) return new Set();
  const { held = [] } = await locks.query();
  return new Set(held.map((lock) => lock.name ?? ''));
};

const isJobLocked = async (id: string): Promise<boolean> => (await heldLocks()).has(lockName(id));

export { isJobLocked };

/* @layer site-kit @kind logic */
import { lockName } from './lock-name';

const heldLocks = async (): Promise<Set<string>> => {
  if (!navigator.locks?.query) return new Set();
  const { held = [] } = await navigator.locks.query();
  return new Set(held.map((lock) => lock.name ?? ''));
};

const isJobLocked = async (id: string): Promise<boolean> => (await heldLocks()).has(lockName(id));

export { isJobLocked };

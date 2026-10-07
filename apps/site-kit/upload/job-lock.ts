/* @layer site-kit @kind logic */
/**
 * One tab runs a job at a time. A running job holds a Web Lock named after it, so a second
 * tab of the same site restoring its records leaves that job to the tab already sending it.
 * A browser without Web Locks runs the job unguarded.
 */
const lockName = (id: string) => `site-upload:${id}`;

const heldLocks = async (): Promise<Set<string>> => {
  if (!navigator.locks?.query) return new Set();
  const { held = [] } = await navigator.locks.query();
  return new Set(held.map((lock) => lock.name ?? ''));
};

/** Whether another tab is running this job now. */
const isJobLocked = async (id: string): Promise<boolean> => (await heldLocks()).has(lockName(id));

/** Runs the job under its lock; answers false, without running it, when another tab holds it. */
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

export { isJobLocked, withJobLock };

/* @layer electron-main @kind logic */
let queue: Promise<unknown> = Promise.resolve();

const serializeAllocation = <T>(task: () => Promise<T>): Promise<T> => {
  const run = queue.then(task, task);
  queue = run.then(() => undefined, () => undefined);
  return run;
};

export { serializeAllocation };

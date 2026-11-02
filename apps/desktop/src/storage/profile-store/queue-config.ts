/* @layer renderer-lib @kind logic */
const tails = new Map<string, Promise<unknown>>();

const queueConfig = <T>(id: string, task: () => Promise<T>): Promise<T> => {
  const run = (tails.get(id) ?? Promise.resolve()).then(task);
  const tail = run.catch(() => undefined);
  tails.set(id, tail);
  void tail.then(() => {
    if (tails.get(id) === tail) tails.delete(id);
  });
  return run;
};

export { queueConfig };

/* @layer shared-storage @kind logic */
const mapLimited = async <T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> => {
  const out = new Array<R>(items.length);
  const pending = items.entries();
  const worker = async (): Promise<void> => {
    for (const [index, item] of pending) {
      out[index] = await fn(item);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return out;
};

export { mapLimited };

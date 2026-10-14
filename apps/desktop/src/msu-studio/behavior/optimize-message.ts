/* @layer renderer-components @kind logic */
const optimizeMessage = (err: unknown, fallback: string): string =>
  (err instanceof Error && err.message.length > 0 ? err.message : fallback);

export { optimizeMessage };

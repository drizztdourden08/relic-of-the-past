/* @layer renderer-components @kind logic */
import type { ActionResult } from '../msu.type';

const failure = (err: unknown, fallback: string): ActionResult => ({
  success: false, message: err instanceof Error ? err.message : fallback,
});

export { failure };

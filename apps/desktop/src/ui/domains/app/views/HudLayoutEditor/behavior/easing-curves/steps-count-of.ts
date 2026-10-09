/* @layer renderer-components @kind logic */
import { MIN_STEPS } from './easing-curves.constants';

const stepsCountOf = (name: string | undefined): number | null => {
  if (name === undefined) return null;
  const match = /^steps\((\d+)\)$/.exec(name.trim());
  if (!match) return null;
  const n = Number(match[1]);
  return Number.isFinite(n) && n >= MIN_STEPS ? n : null;
};

export { stepsCountOf };

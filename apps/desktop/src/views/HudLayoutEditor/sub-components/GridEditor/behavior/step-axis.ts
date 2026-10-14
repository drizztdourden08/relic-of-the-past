/* @layer renderer-components @kind logic */
const clamp = (value: number, max: number): number => Math.min(Math.max(value, 1), Math.max(1, max));

const stepAxis = (current: number, delta: number, jump: boolean, max: number): number => {
  if (!jump || delta === 0) return clamp(current + delta, max);
  return delta < 0 ? 1 : max;
};

export { stepAxis };

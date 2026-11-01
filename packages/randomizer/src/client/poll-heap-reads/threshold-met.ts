/* @layer bridge-wasm @kind logic */
const thresholdMet = (val: number, compare: 'gte' | 'eq' | 'any-of', value: number | number[] | undefined): boolean => {
  if (compare === 'gte') return val >= (value as number);
  if (compare === 'eq') return val === (value as number);
  return (value as number[]).includes(val);
};

export { thresholdMet };

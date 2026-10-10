/* @layer renderer-components @kind logic */
const stepState = (index: number, current: number): string => {
  if (index === current) return 'current';
  return index < current ? 'done' : 'upcoming';
};

export { stepState };

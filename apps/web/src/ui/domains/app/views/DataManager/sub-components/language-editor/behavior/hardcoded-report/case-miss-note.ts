/* @layer renderer-components @kind logic */
const caseMissNote = (misses: number): string => (
  misses === 0 ? '' : `${misses} differ in case and stay as they are`
);

export { caseMissNote };

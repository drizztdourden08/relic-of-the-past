/* @layer renderer-lib @kind logic */
const axisPressed = (val: number | undefined, dir: string | undefined, threshold: number): boolean => {
  if (val === undefined) return false;
  return (dir === '+' && val > threshold) || (dir === '-' && val < -threshold);
};

export { axisPressed };

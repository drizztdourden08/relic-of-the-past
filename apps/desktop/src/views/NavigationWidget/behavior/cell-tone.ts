/* @layer renderer-widgets @kind logic */
const cellTone = (isActive: boolean, analyzed: boolean): string => {
  if (isActive) return 'active';
  return analyzed ? 'analyzed' : 'idle';
};

export { cellTone };

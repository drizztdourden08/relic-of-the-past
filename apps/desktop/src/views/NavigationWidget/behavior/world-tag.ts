/* @layer renderer-widgets @kind logic */
const worldTag = (isIndoors: boolean, isDarkWorld: boolean): string => {
  if (isIndoors) return 'INDOOR';
  return isDarkWorld ? 'DW' : 'LW';
};

export { worldTag };

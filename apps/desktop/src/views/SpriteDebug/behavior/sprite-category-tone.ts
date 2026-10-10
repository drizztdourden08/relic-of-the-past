/* @layer renderer-components @kind logic */
const spriteCategoryTone = (category: string): string => {
  if (category === 'hud' || category === 'hud-pause' || category === 'hud-item') return 'hud';
  if (category === 'fonts' || category === 'receipt') return category;
  return 'other';
};

export { spriteCategoryTone };

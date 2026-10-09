/* @layer renderer-lib @kind logic */
const sanitizeStem = (baseName: string): string => {
  const cleaned = baseName.replace(/[\\/:*?"<>|]/g, '').trim();
  return cleaned.length > 0 ? cleaned : 'pack';
};

export { sanitizeStem };

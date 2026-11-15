/* @layer shared-asset-extraction @kind logic */
const composeToken = (letter: string, mark: string): string | null => {
  const token = `${letter}${mark}`.normalize('NFC');
  return [...token].length === 1 ? token : null;
};

export { composeToken };

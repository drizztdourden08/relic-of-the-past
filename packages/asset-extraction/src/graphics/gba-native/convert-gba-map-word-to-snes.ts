/* @layer shared-asset-extraction @kind logic */
const convertGbaMapWordToSnes = (word: number, priority = false): number => {
  const palette = word >>> 12;
  if (palette > 7) throw new Error(`GBA palette bank ${palette} cannot be represented by a SNES BG tile word`);
  return (word & 0x03ff)
    | (palette << 10)
    | (priority ? 0x2000 : 0)
    | ((word & 0x0400) << 4)
    | ((word & 0x0800) << 4);
};

export { convertGbaMapWordToSnes };

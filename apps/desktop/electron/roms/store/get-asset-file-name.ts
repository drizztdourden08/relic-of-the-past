/* @layer electron-main @kind logic */
const getAssetFileName = (romFile: string): string => {
  return romFile.replace(/\.(sfc|smc)$/i, '.dat');
};

export { getAssetFileName };

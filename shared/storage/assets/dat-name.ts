/* @layer shared-storage @kind logic */
const datName = (romFile: string): string => romFile.replace(/\.(sfc|smc)$/i, '.dat');

export { datName };

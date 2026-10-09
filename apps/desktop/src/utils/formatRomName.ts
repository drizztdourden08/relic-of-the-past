/* @layer renderer-other @kind logic */
const formatRomName = (romFile: string): string => romFile.replace(/\.(sfc|smc)$/i, '');

export { formatRomName };

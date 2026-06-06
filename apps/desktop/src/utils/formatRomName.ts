/** Strip the ROM file extension (.sfc/.smc) for display. */
const formatRomName = (romFile: string): string => romFile.replace(/\.(sfc|smc)$/i, '');

export { formatRomName };

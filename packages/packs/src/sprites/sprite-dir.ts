/* @layer shared-storage @kind logic */
const spriteDir = (romFile: string): string => `sprites/${romFile.replace(/\.(sfc|smc)$/i, '')}`;

export { spriteDir };

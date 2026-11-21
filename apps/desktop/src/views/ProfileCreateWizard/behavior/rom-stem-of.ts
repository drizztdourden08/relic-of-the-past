/* @layer renderer-components @kind logic */
const romStemOf = (rom: string): string => rom.replace(/\.(sfc|smc)$/i, '');

export { romStemOf };

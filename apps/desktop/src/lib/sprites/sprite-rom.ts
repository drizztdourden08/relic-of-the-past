/* @layer renderer-lib @kind logic */
const spriteRomOf = (
  activeRomFile: string | null | undefined, roms: readonly RomInfo[],
): string | null =>
  activeRomFile || roms.find((rom) => rom.hasAssets)?.romFile || roms[0]?.romFile || null;

export { spriteRomOf };

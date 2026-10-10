/* @layer renderer-lib @kind logic */
const spriteRomOf = (
  activeRomFile: string | null | undefined, roms: readonly { romFile: string; hasAssets: boolean }[],
): string | null =>
  [activeRomFile, roms.find((rom) => rom.hasAssets)?.romFile, roms[0]?.romFile].find(Boolean) ?? null;

export { spriteRomOf };

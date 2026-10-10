/* @layer renderer-lib @kind logic */
import type { SpriteRomCandidate } from './sprite-rom.type';

const spriteRomOf = (
  activeRomFile: string | null | undefined, roms: readonly SpriteRomCandidate[],
): string | null =>
  [activeRomFile, roms.find((rom) => rom.hasAssets)?.romFile, roms[0]?.romFile].find(Boolean) ?? null;

export { spriteRomOf };

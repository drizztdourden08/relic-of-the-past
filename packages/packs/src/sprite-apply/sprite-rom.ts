/* @layer renderer-lib @kind logic */
import type { SpriteRomCandidate } from './sprite-rom.type';

const nonEmpty = (value: string | null | undefined): string | null =>
  value === undefined || value === null || value === '' ? null : value;

const spriteRomOf = (
  activeRomFile: string | null | undefined, roms: readonly SpriteRomCandidate[],
): string | null =>
  nonEmpty(activeRomFile)
  ?? nonEmpty(roms.find((rom) => rom.hasAssets)?.romFile)
  ?? nonEmpty(roms[0]?.romFile);

export { spriteRomOf };

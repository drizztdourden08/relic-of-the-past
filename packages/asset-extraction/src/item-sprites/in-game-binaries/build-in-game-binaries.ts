/* @layer shared-asset-extraction @kind logic */
import { IN_GAME_BINARIES } from './in-game-binaries.constants';
import type { BinaryBuffers, PaletteRows, Pictures } from './in-game-binaries.type';

const buildInGameBinaries = (
  pictures: Pictures, defined: ReadonlySet<string>, paletteRows: PaletteRows,
): BinaryBuffers => {
  const result: BinaryBuffers = { buffers: [], errors: [] };
  for (const binary of IN_GAME_BINARIES) {
    if (!binary.files.every((file) => defined.has(file))) continue;
    const bytes = binary.build(pictures, paletteRows);
    if (bytes) result.buffers.push({ name: binary.name, bytes });
    else result.errors.push(`${binary.name}: not built, ${binary.failure}`);
  }
  return result;
};

export { buildInGameBinaries };

/* @layer shared-asset-extraction @kind logic */
import type { RomData } from '../rom/rom-types';
import { readByteRegion } from './read-byte-region';
import type { CopyScreenSource } from './screen-payload.type';
import { COPY_SOURCE_ROWS, COPY_TARGET_DIGIT_BYTES, COPY_TARGET_ROWS } from './screens.constants';

const readCopyScreen = (rom: RomData, source: CopyScreenSource | undefined): Uint8Array | undefined =>
  source
    ? Uint8Array.of(
      ...readByteRegion(rom, { address: source.sourceFairyX, count: COPY_SOURCE_ROWS }),
      ...readByteRegion(rom, { address: source.targetFairyX, count: COPY_TARGET_ROWS }),
      ...readByteRegion(rom, { address: source.sourceBlankColumn, count: 1 }),
      ...readByteRegion(rom, { address: source.targetBlankColumn, count: 1 }),
      ...readByteRegion(rom, { address: source.targetDigits, count: COPY_TARGET_DIGIT_BYTES }),
    )
    : undefined;

export { readCopyScreen };

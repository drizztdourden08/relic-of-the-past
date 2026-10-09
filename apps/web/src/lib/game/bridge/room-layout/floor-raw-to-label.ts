/* @layer bridge-wasm @kind logic */
import { BYTE_RANGE, FIRST_BASEMENT_FLOOR_RAW } from './room-layout.constants';

const floorRawToLabel = (raw: number): string => {
  if (raw === 0) return '1F';
  if (raw < FIRST_BASEMENT_FLOOR_RAW) return `${raw + 1}F`;
  const basement = BYTE_RANGE - raw;
  return `B${basement}`;
};

export { floorRawToLabel };

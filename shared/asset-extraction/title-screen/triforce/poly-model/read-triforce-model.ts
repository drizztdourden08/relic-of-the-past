/* @layer shared-asset-extraction @kind logic */
import type { RomData } from '../../../rom/rom-types';
import type { PolyModel, Vertex } from './poly-model.type';
import {
  ADDR_SIN_COS, ADDR_TRIFORCE_FACES, ADDR_TRIFORCE_VERTICES, FACE_HEADER_AND_COLOUR_BYTES, SIN_COS_LENGTH,
  TRIFORCE_FACE_COUNT, TRIFORCE_VERTEX_COUNT,
} from './poly-model.constants';
import { signed8 } from './signed8';

const readFaces = (rom: RomData): number[] => {
  const faces: number[] = [];
  let p = ADDR_TRIFORCE_FACES;
  for (let f = 0; f < TRIFORCE_FACE_COUNT; f += 1) {
    const n = rom.getByte(p);
    for (let i = 0; i < n + FACE_HEADER_AND_COLOUR_BYTES; i += 1) faces.push(rom.getByte(p + i));
    p += n + FACE_HEADER_AND_COLOUR_BYTES;
  }
  return faces;
};

const readTriforceModel = (rom: RomData): PolyModel => {
  const raw = rom.getBytes(ADDR_TRIFORCE_VERTICES, TRIFORCE_VERTEX_COUNT * 3);
  const vertices = Array.from({ length: TRIFORCE_VERTEX_COUNT }, (_, i): Vertex =>
    [signed8(raw[i * 3]), signed8(raw[i * 3 + 1]), signed8(raw[i * 3 + 2])]);
  const sinCos = Array.from(rom.getBytes(ADDR_SIN_COS, SIN_COS_LENGTH), signed8);
  return { vertices, faces: readFaces(rom), faceCount: TRIFORCE_FACE_COUNT, sinCos };
};

export { readTriforceModel };

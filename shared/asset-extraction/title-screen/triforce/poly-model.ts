/* @layer shared-asset-extraction @kind logic */
/**
 * The polyhedral engine's triforce model, read from the ROM (bank 09, the tables
 * poly.c carries as kPoly1_Vtx, kPoly1_Polys and kPolySinCos), plus the pose the title
 * leaves it in once the pieces have landed.
 */
import type { RomData } from '../../rom/rom-types';

const ADDR_SIN_COS = 0x89fb6d;
const SIN_COS_LENGTH = 320;
const ADDR_TRIFORCE_VERTICES = 0x89ffd2;
const ADDR_TRIFORCE_FACES = 0x89ffe4;
const TRIFORCE_VERTEX_COUNT = 6;
const TRIFORCE_FACE_COUNT = 5;

type Vertex = readonly [x: number, y: number, z: number];

interface PolyModel {
  vertices: Vertex[];
  /** Per face: vertex count, that many vertex indices, then a colour byte the engine ignores. */
  faces: number[];
  faceCount: number;
  /** Signed sine table; cosine is the same table 64 entries on. */
  sinCos: number[];
}

/**
 * The rest pose: both angles zero, the distance term (poly_config1) run down to zero,
 * and the picture centred at (32, 32) of its 64x64 bitmap (Intro_InitGfx_Helper, Intro_RunStep).
 */
interface PolyPose {
  a: number;
  b: number;
  distance: number;
  baseX: number;
  baseY: number;
}

const TRIFORCE_REST_POSE: PolyPose = { a: 0, b: 0, distance: 0, baseX: 32, baseY: 32 };

const signed8 = (v: number): number => (v << 24) >> 24;

const readFaces = (rom: RomData): number[] => {
  const faces: number[] = [];
  let p = ADDR_TRIFORCE_FACES;
  for (let f = 0; f < TRIFORCE_FACE_COUNT; f += 1) {
    const n = rom.getByte(p);
    for (let i = 0; i < n + 2; i += 1) faces.push(rom.getByte(p + i));
    p += n + 2;
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

export { readTriforceModel, signed8, TRIFORCE_REST_POSE };
export type { PolyModel, PolyPose, Vertex };

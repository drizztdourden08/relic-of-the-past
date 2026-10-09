/* @layer shared-asset-extraction @kind constants */
import type { PolyPose } from './poly-model.type';

const ADDR_SIN_COS = 0x89fb6d;

const SIN_COS_LENGTH = 320;

const ADDR_TRIFORCE_VERTICES = 0x89ffd2;

const ADDR_TRIFORCE_FACES = 0x89ffe4;

const TRIFORCE_VERTEX_COUNT = 6;

const TRIFORCE_FACE_COUNT = 5;

const FACE_HEADER_AND_COLOUR_BYTES = 2;

const TRIFORCE_REST_POSE: PolyPose = { a: 0, b: 0, distance: 0, baseX: 32, baseY: 32 };

export {
  ADDR_SIN_COS, ADDR_TRIFORCE_FACES, ADDR_TRIFORCE_VERTICES, FACE_HEADER_AND_COLOUR_BYTES, SIN_COS_LENGTH,
  TRIFORCE_FACE_COUNT, TRIFORCE_REST_POSE, TRIFORCE_VERTEX_COUNT,
};

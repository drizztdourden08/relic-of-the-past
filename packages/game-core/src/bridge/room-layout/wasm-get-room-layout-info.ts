/* @layer bridge-wasm @kind logic */
import { readU8, callPtr } from '../wasm-call';
import { LAYOUT_SHAPES, NOT_MERGED_BY_BLASTWALL } from './room-layout.constants';
import type { RoomEdge, RoomLayoutInfo } from './room-layout.type';

const verticalEdges = (qfy: number, qy: number): RoomEdge[] => {
  if (qfy !== NOT_MERGED_BY_BLASTWALL) return [];
  if (qy === 0) return ['south'];
  return qy === 2 ? ['north'] : [];
};

const horizontalEdges = (qfx: number, qx: number): RoomEdge[] => {
  if (qfx !== NOT_MERGED_BY_BLASTWALL) return [];
  if (qx === 0) return ['east'];
  return qx === 1 ? ['west'] : [];
};

const wasmGetRoomLayoutInfo = (): RoomLayoutInfo | null =>
  callPtr('WasmGetRoomLayoutInfo', (mod, ptr) => {
    const heap = mod.HEAPU8;
    const layout = readU8(heap, ptr);
    const qfx = readU8(heap, ptr + 1);
    const qfy = readU8(heap, ptr + 2);
    const qx = readU8(heap, ptr + 3);
    const qy = readU8(heap, ptr + 4);
    const shape = LAYOUT_SHAPES[layout] ?? '1x1';

    const intraEdges: RoomEdge[] = [
      ...(shape === '2x2' || shape === '1x2' ? verticalEdges(qfy, qy) : []),
      ...(shape === '2x2' || shape === '2x1' ? horizontalEdges(qfx, qx) : []),
    ];

    return { layout, shape, quadrantFullsizeX: qfx, quadrantFullsizeY: qfy, quadrantX: qx, quadrantY: qy, intraEdges };
  });

export { wasmGetRoomLayoutInfo };

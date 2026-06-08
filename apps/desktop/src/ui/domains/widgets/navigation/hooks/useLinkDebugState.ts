/* @layer renderer-widgets @kind hook */
import { wasmGetViewportInfo, wasmGetLinkLayer, wasmGetRoomCollisionType, wasmGetStaircaseType } from '../../../../../lib/game';

interface LinkDebugState {
  linkX: number;
  linkY: number;
  relX: number;
  relY: number;
  tileMinCol: number;
  tileMaxCol: number;
  tileMinRow: number;
  tileMaxRow: number;
  map16Row: number;
  map16Col: number;
  liveScreenIndex: number;
  linkLayer: number | null;
  collisionType: number | null;
  staircaseType: number | null;
}

const useLinkDebugState = (_debugTick: number): LinkDebugState | null => {
  const vpDebug = wasmGetViewportInfo?.();
  if (!vpDebug) return null;

  const liveScreenCol = (vpDebug.linkX >> 9) & 7;
  const liveScreenRow = (vpDebug.linkY >> 9) & 7;
  const liveScreenIndex = (liveScreenRow << 3) | liveScreenCol;
  const screenWorldX = liveScreenCol * 512;
  const screenWorldY = liveScreenRow * 512;

  const relX = vpDebug.linkX - screenWorldX;
  const relY = vpDebug.linkY - screenWorldY;
  const tileMinCol = Math.floor(relX / 8);
  const tileMaxCol = Math.floor((relX + 15) / 8);
  const tileMinRow = Math.floor(relY / 8);
  const tileMaxRow = Math.floor((relY + 15) / 8);

  const xc = vpDebug.linkX >> 3;
  const baseX = screenWorldX >> 3;
  const map16Col = ((xc - baseX) & 0x3E) >> 1;
  const yc = vpDebug.linkY + 7;
  const baseY = screenWorldY;
  const map16Row = ((yc - baseY) & 0x1F0) >> 4;

  return {
    linkX: vpDebug.linkX,
    linkY: vpDebug.linkY,
    relX,
    relY,
    tileMinCol,
    tileMaxCol,
    tileMinRow,
    tileMaxRow,
    map16Row,
    map16Col,
    liveScreenIndex,
    linkLayer: wasmGetLinkLayer?.() ?? null,
    collisionType: wasmGetRoomCollisionType?.() ?? null,
    staircaseType: wasmGetStaircaseType?.() ?? null,
  };
};

export { useLinkDebugState };
export type { LinkDebugState };

/* @layer renderer-components @kind types */
import type React from 'react';
import type { viewOrigin } from '@rotp/game-core';

interface PointerWorldParams {
  event: React.MouseEvent<HTMLDivElement>;
  vp: Parameters<typeof viewOrigin>[0] & { snesWidth: number; snesHeight: number };
  width: number;
  height: number;
}

interface PointerWorld {
  mx: number;
  my: number;
  scaleX: number;
  scaleY: number;
  viewLeft: number;
  viewTop: number;
  worldX: number;
  worldY: number;
}

export type { PointerWorld, PointerWorldParams };

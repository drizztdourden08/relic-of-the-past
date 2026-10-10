/* @layer renderer-widgets @kind types */
import type { ConnectionInfo } from '@rotp/game-core';

interface EdgeBadgeBox {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface EdgeBadgeProps {
  connection: ConnectionInfo;
  box: EdgeBadgeBox;
  title: string;
}

export type { EdgeBadgeBox, EdgeBadgeProps };

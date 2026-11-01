/* @layer renderer-widgets @kind types */
import type { BorderEdge, ConnectionInfo } from '@rotp/game-core';

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

interface EdgeBadgeRowsProps {
  byEdge: Record<BorderEdge, ConnectionInfo[]>;
  offsets: Record<BorderEdge, number>;
  horizontalBox: (connection: ConnectionInfo, top: number) => EdgeBadgeBox;
  verticalBox: (connection: ConnectionInfo, left: number) => EdgeBadgeBox;
}

export type { EdgeBadgeBox, EdgeBadgeProps, EdgeBadgeRowsProps };

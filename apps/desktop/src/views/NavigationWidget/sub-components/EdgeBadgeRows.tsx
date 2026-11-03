/* @layer renderer-widgets @kind component */
import type { ConnectionInfo } from '@rotp/game-core';
import { badgeTitle } from '../behavior/badge-title';
import { EdgeBadge } from './EdgeBadge';
import type { EdgeBadgeRowsProps } from './EdgeBadge.type';

const EdgeBadgeRows = ({ byEdge, offsets, horizontalBox, verticalBox }: EdgeBadgeRowsProps) => {
  const horizontal = (list: ConnectionInfo[], prefix: string, top: number) => list.map((c, i) => (
    <EdgeBadge key={`${prefix}${i}`} connection={c} box={horizontalBox(c, top)} title={badgeTitle(c, 'c')} />
  ));
  const vertical = (list: ConnectionInfo[], prefix: string, left: number) => list.map((c, i) => (
    <EdgeBadge key={`${prefix}${i}`} connection={c} box={verticalBox(c, left)} title={badgeTitle(c, 'r')} />
  ));

  return (
    <>
      {horizontal(byEdge.north, 'n', offsets.north)}
      {horizontal(byEdge.south, 's', offsets.south)}
      {vertical(byEdge.west, 'w', offsets.west)}
      {vertical(byEdge.east, 'e', offsets.east)}
    </>
  );
};

export { EdgeBadgeRows };

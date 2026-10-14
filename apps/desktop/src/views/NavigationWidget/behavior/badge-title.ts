/* @layer renderer-widgets @kind logic */
import type { ConnectionInfo } from '@rotp/game-core';
import { getScreenDisplayName } from '../../../nav-widget/widget-helpers';
import { positionSpan } from './position-span';

const badgeTitle = (connection: ConnectionInfo, axis: 'c' | 'r'): string => {
  const { first, last } = positionSpan(connection.positions);
  return `${getScreenDisplayName(connection.targetScreen)} ${axis}${first}-${last} (${connection.positions.length})`;
};

export { badgeTitle };

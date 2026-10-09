/* @layer shared-game @kind logic */
import type { GridPos } from '@rotp/game-core';
import { getConnection } from '@rotp/game-data';
import type { SimExit } from '../../types';
import type { ScreenEdge } from '../traversal/traversal.type';
import { SCREEN_CENTER } from '../engine.constants';

const entryTileFor = (edge: ScreenEdge): GridPos =>
  getConnection(edge.connection.toConnectionId).nav?.fromPoint?.position ?? SCREEN_CENTER;

const landingTile = (exit?: SimExit, edge?: ScreenEdge): GridPos =>
  exit ? (exit.entryTile ?? SCREEN_CENTER) : entryTileFor(edge!);

export { landingTile };

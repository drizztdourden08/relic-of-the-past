/* @layer shared-game @kind logic */
import type { GridPos } from '@rotp/game-core';
import { getConnection } from '@rotp/game-data';
import type { ScreenEdge } from '../traversal/traversal.type';
import type { HopLink } from './hop.type';
import { SCREEN_CENTER } from '../engine.constants';

const entryTileFor = (edge: ScreenEdge): GridPos =>
  getConnection(edge.connection.toConnectionId).nav?.fromPoint?.position ?? SCREEN_CENTER;

const landingTile = ({ exit, edge }: HopLink): GridPos => {
  if (exit) return exit.entryTile ?? SCREEN_CENTER;
  if (!edge) throw new Error('A hop needs a discovered exit or an adjacency edge');
  return entryTileFor(edge);
};

export { landingTile };

/* @layer bridge-wasm @kind logic */
import type { GridPos } from '@rotp/game-core';
import { regionQualifier } from './region-qualifier';
import { usesCachedEntrance } from './uses-cached-entrance';

const interiorScreenId = (destRoom: number, landing?: GridPos, cameFrom?: string): string => {
  const base = `room:${destRoom}${regionQualifier(landing)}`;
  if (!usesCachedEntrance(destRoom) || !cameFrom) return base;
  const alreadyQualified = cameFrom.startsWith('^');
  return alreadyQualified ? `${base}${cameFrom}` : `${base}^${cameFrom}`;
};

export { interiorScreenId };

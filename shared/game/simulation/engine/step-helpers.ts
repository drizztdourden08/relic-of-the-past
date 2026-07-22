/* @layer shared-game @kind logic */
/**
 * Stateless helpers for the step machine: event constructors, edge key-spending,
 * and the tile the virtual Link lands on when crossing an edge.
 */
import type { SimEvent } from '../types';
import type { GridPos } from '../../navigation/types';
import type { ScreenEdge } from './traversal';
import { spendKey } from './explorer';
import type { EngineState } from './state';

const SCREEN_CENTER: GridPos = { row: 32, col: 32 };

const narrative = (s: EngineState, msg: string): SimEvent => ({ level: 'narrative', msg, step: s.step });
const debug = (s: EngineState, msg: string, data?: unknown): SimEvent => ({ level: 'debug', msg, step: s.step, data });

const spendKeysForEdge = (s: EngineState, edge: ScreenEdge): void => {
  for (const group of edge.requirements) {
    for (const token of group) {
      if (token.startsWith('smallkey:')) spendKey(s, token.slice('smallkey:'.length));
    }
  }
};

/** Where the virtual Link lands when crossing an edge — the connection's entry point, else screen centre. */
const entryTileFor = (edge: ScreenEdge): GridPos => edge.connection.nav?.toPoint?.position ?? SCREEN_CENTER;

export { narrative, debug, spendKeysForEdge, entryTileFor, SCREEN_CENTER };

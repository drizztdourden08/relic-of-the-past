/* @layer shared-game @kind types */
import type { ConnectionRecord, RequirementSet } from '@rotp/game-data';

interface ScreenEdge {
  to: string;
  requirements: RequirementSet;
  connection: ConnectionRecord;
}

type Adjacency = Map<string, ScreenEdge[]>;

type CanPass = (edge: ScreenEdge) => boolean;

interface PathQuery {
  adjacency: Adjacency;
  from: string;
  to: string;
  canPass: CanPass;
}

interface ScreenPathResult {
  path: string[];
  edges: ScreenEdge[];
}

type PathLinks = Map<string, { via: string; edge: ScreenEdge }>;

export type { ScreenEdge, Adjacency, CanPass, PathQuery, ScreenPathResult, PathLinks };

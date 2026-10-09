/* @layer shared-game @kind types */
import type { ConnectionRecord } from '../../../data';
import type { RequirementSet } from '../../../navigation/nav-data.types';

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

/* @layer shared-game @kind types */
import type { CheckId } from '../../data';
import type { SimOutcome, DatasetSuggestion } from '../types';

interface SimRunConfig {
  startSlot: number | null;
  stateName: string | null;
  target: string | null;
  stopAtCheckId: CheckId | null;
  maxSteps: number;
  floodScreen: number | null;
  probeRoom: number | null;
  probeItems: string[] | null;
  probeTile: { row: number; col: number } | null;
  scanSprite: number | null;
  combatSprite: number | null;
  screenWalkLimit: number | null;
}

interface BoundaryEdge {
  from: string;
  to: string;
  tags: string[];
}

interface SimRunReport {
  outcome: SimOutcome | null;
  reachedTarget: boolean;
  startSlot: number | null;
  target: string | null;
  steps: number;
  reachedScreens: string[];
  verifiedChecks: CheckId[];
  boundaryEdges: BoundaryEdge[];
  suggestions: DatasetSuggestion[];
}

interface ReportMeta {
  config: SimRunConfig;
  steps: number;
  reachedTarget: boolean;
}

export type { SimRunConfig, SimRunReport, BoundaryEdge, ReportMeta };

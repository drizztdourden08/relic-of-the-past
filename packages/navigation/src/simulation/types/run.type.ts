/* @layer shared-game @kind types */
import type { TraversalRequirement, CheckId } from '@rotp/game-data';

type SimPhase =
  | 'idle'
  | 'observing'
  | 'planning'
  | 'traversing'
  | 'triggering'
  | 'verifying'
  | 'done';

type SimOutcome = 'completed' | 'stopped-at-check' | 'not-completable';

interface SimConfig {
  stopAtCheckId?: CheckId;
  goalCheckId?: CheckId;
  screenLimit?: number;
}

interface SimEvent {
  level: 'narrative' | 'debug';
  msg: string;
  step: number;
  data?: unknown;
}

interface DatasetSuggestion {
  kind: 'connection' | 'screen' | 'check';
  targetFile: string;
  targetId: string | null;
  code: string;
  reason: string;
}

interface SoftlockReport {
  completed: CheckId[];
  blocked: Array<{ checkId: CheckId; missing: TraversalRequirement[][] }>;
  unreachedScreens: string[];
}

export type { SimPhase, SimOutcome, SimConfig, SimEvent, DatasetSuggestion, SoftlockReport };

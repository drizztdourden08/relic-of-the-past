/* @layer bridge-wasm @kind types */
import type { EngineState, RecorderState, buildEndSummary } from '@shared/game/simulation';
import type { CheckId } from '@shared/game/data';
import type { GridPos } from '@shared/game/navigation';

interface ScreenFloodLog {
  screenId: string;
  reachable: number;
  total: number;
  entrances: number;
  edges: number;
}

interface VisitLog {
  screenId: string;
  name: string;
  indoors: boolean;
  index: number;
  tile: GridPos;
  epoch: number;
  reached: number;
  exits: Array<{ to: string; steps?: number; origin?: string }>;
}

interface PathStep {
  screenId: string;
  name: string;
  indoors: boolean;
  index: number;
  observed: boolean;
  via?: string;
  gained?: string[];
  lost?: string[];
}

interface CheckLog {
  checkId: CheckId;
  name: string;
  screenId: string;
  atPathIndex: number;
  step: number;
  items: string[];
}

interface LogLine {
  step: number;
  msg: string;
}

interface DriveTally { regionJobs: number; backtracks: number; epochResets: number; hops: number }

interface DriveResult {
  state: EngineState;
  recorder: RecorderState;
  steps: number;
  reachedTarget: boolean;
  screenFloods: ScreenFloodLog[];
  visits: VisitLog[];
  path: PathStep[];
  checks: CheckLog[];
  log: LogLine[];
  tally: DriveTally;
  endSummary: ReturnType<typeof buildEndSummary>;
}

export type { DriveResult, ScreenFloodLog, VisitLog, PathStep, CheckLog, LogLine, DriveTally };

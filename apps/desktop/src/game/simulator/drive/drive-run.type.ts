/* @layer bridge-wasm @kind types */
import type { createEngine, createRecorder } from '@rotp/navigation';
import type { CheckLog, DetectedScreen, DriveTally, EngineState, LogLine, PathStep, ScreenFloodLog, VisitLog } from '@rotp/navigation';
import type { ItemId } from '@rotp/game-data';

type DriveRun = {
  engine: ReturnType<typeof createEngine>;
  recorder: ReturnType<typeof createRecorder>;
  state: EngineState;
  steps: number;
  reachedTarget: boolean;
  item: ItemId | undefined;
  cache: Map<string, DetectedScreen | null>;
  screenFloods: ScreenFloodLog[];
  visits: VisitLog[];
  path: PathStep[];
  prevInv: string[];
  checks: CheckLog[];
  log: LogLine[];
  tally: DriveTally;
};

export type { DriveRun };

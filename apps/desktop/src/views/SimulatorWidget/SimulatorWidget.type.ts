/* @layer renderer-widgets @kind types */
import type { RefObject } from 'react';
import type { createEngine, DatasetSuggestion, EngineState, RecorderState, SimConfig, SimEvent, SimOutcome, SimulatorPort, SoftlockReport, TriggerAction } from '@rotp/navigation';
import type { CheckId, ItemId } from '@rotp/game-data';
import type { SimLogWriter } from '@app/game/simulator';
import type { DetectCache } from '@app/game/simulator/observe';
import type { ScreenEditorApi } from '@app/ipc';
import type { IconName } from '@drizztdourden08/tessera/primitives';
import type { RunStatus, SimProgress, TrailStop, useSimulatorStore } from '@app/stores/simulator-store';

interface RunControl {
  running: boolean;
  paused: boolean;
}

interface RunResults {
  outcome: SimOutcome | null;
  suggestions: DatasetSuggestion[];
  softlockReport: SoftlockReport | null;
}

type SimulatorStoreState = ReturnType<typeof useSimulatorStore.getState>;

interface RunContext {
  port: SimulatorPort;
  writer: SimLogWriter;
  store: SimulatorStoreState;
  recorder: RecorderState;
  engine: ReturnType<typeof createEngine>;
  detectCache: DetectCache;
  takeItem: () => ItemId | undefined;
}

interface RunCursor {
  state: EngineState;
  sequenceLabel: string | null;
}

interface RunStepResult {
  actions: TriggerAction[];
  events: SimEvent[];
  nextState: EngineState;
}

interface DriveParams {
  port: SimulatorPort;
  writer: SimLogWriter;
  config: SimConfig;
  control: RefObject<RunControl>;
  takeItem: () => ItemId | undefined;
}

interface RunRefs {
  control: RefObject<RunControl>;
  port: RefObject<SimulatorPort | null>;
  writer: RefObject<SimLogWriter | null>;
  snapshot: RefObject<ArrayBuffer | null>;
  item: RefObject<ItemId | undefined>;
}

interface StartParams {
  stopAtCheckId: CheckId | '';
  screenLimitRef: RefObject<number | null>;
  onCanRestore: (canRestore: boolean) => void;
}

interface SimLogSink {
  write: (event: SimEvent) => void;
}

type ApplyResult = { success: boolean; error?: string };
type CheckWriter = (args: { filePath: string; code: string; checkId: string | null }) => Promise<ApplyResult>;

type EditorWithOptionalCheck = Omit<ScreenEditorApi, 'writeCheck'> & { writeCheck?: CheckWriter };

type LogKind = 'seq' | 'area' | 'screen' | 'pos' | 'backtrack' | 'flood' | 'reset' | 'check' | 'item' | 'move' | 'unlock' | 'outcome' | 'discover' | 'info' | 'debug';

interface LogStyle {
  kind: LogKind;
  tag: string;
}

interface LogRule {
  pattern: RegExp;
  style: LogStyle;
}

interface EventLogProps {
  events: SimEvent[];
}

interface LogDialogProps {
  open: boolean;
  onClose: () => void;
  events: SimEvent[];
}

interface ProgressSummaryProps {
  status: RunStatus;
  phaseLabel: string;
  progress: SimProgress;
}

interface ResultsPanelProps {
  outcome: SimOutcome | null;
  stopAtCheckId: CheckId | '';
  softlockReport: SoftlockReport | null;
  suggestions: DatasetSuggestion[];
  canApplyCheck: boolean;
  onOpenLog: () => void;
  onApply: (suggestion: DatasetSuggestion) => Promise<ApplyResult>;
}

type BannerTone = 'success' | 'danger';

interface OutcomeBanner {
  tone: BannerTone;
  icon: IconName;
  title: string;
  detail: string;
}

interface SoftlockSummaryProps {
  report: SoftlockReport;
}

interface RunControlsProps {
  status: RunStatus;
  stopAtCheckId: CheckId | '';
  onStopAtChange: (id: CheckId | '') => void;
  screenLimit: number | null;
  onScreenLimitChange: (limit: number | null) => void;
  canRestore: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onRestore: () => void;
}

type RunButtonsProps = Pick<RunControlsProps, 'status' | 'canRestore' | 'onStart' | 'onPause' | 'onResume' | 'onStop' | 'onRestore'>;

interface RunTrailProps {
  trail: TrailStop[];
  checksDone: number;
}

interface SuggestionCardProps {
  suggestion: DatasetSuggestion;
  canApplyCheck: boolean;
  onApply: (suggestion: DatasetSuggestion) => Promise<ApplyResult>;
}

type ApplyState = 'idle' | 'applying' | 'applied' | 'error';

export type {
  ApplyResult, ApplyState, DriveParams, EditorWithOptionalCheck, EventLogProps, LogDialogProps, LogKind, LogRule, LogStyle, OutcomeBanner, ProgressSummaryProps,
  ResultsPanelProps, RunButtonsProps, RunContext, RunControl, RunControlsProps, RunCursor, RunRefs, RunResults, RunStepResult, RunTrailProps, SimLogSink, SoftlockSummaryProps, StartParams, SuggestionCardProps,
};

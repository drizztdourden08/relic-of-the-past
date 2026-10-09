/* @layer renderer-widgets @kind types */
import type { DatasetSuggestion, SimEvent, SimOutcome, SoftlockReport } from '@shared/game/simulation';
import type { CheckId } from '@rotp/game-data';
import type { RunStatus, SimProgress, TrailStop } from '@app/stores/simulator-store';

interface RunControl {
  running: boolean;
  paused: boolean;
}

interface RunResults {
  outcome: SimOutcome | null;
  suggestions: DatasetSuggestion[];
  softlockReport: SoftlockReport | null;
}

interface SimLogSink {
  write: (event: SimEvent) => void;
}

type ApplyResult = { success: boolean; error?: string };
type CheckWriter = (args: { filePath: string; code: string; checkId: string | null }) => Promise<ApplyResult>;

type LogKind = 'seq' | 'area' | 'screen' | 'pos' | 'backtrack' | 'flood' | 'reset' | 'check' | 'item' | 'move' | 'unlock' | 'outcome' | 'discover' | 'info' | 'debug';

interface LogStyle {
  kind: LogKind;
  tag: string;
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
  icon: string;
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
  ApplyResult, ApplyState, BannerTone, CheckWriter, EventLogProps, LogDialogProps, LogKind, LogStyle, OutcomeBanner, ProgressSummaryProps,
  ResultsPanelProps, RunControl, RunControlsProps, RunResults, RunTrailProps, SimLogSink, SoftlockSummaryProps, SuggestionCardProps,
};

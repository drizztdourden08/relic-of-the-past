/* @layer renderer-widgets @kind component */
/**
 * Shown when a run finishes: the outcome banner, an Open log button, and the
 * list of dataset suggestions the run produced. Reaching the configured stop
 * check ('stopped-at-check') and completing the goal ('completed') both read as
 * success; only 'not-completable' is a failure (with a softlock summary).
 */
import { Box, Button, Text } from '@ds/primitives';
import type { SimOutcome, SoftlockReport, DatasetSuggestion } from '@shared/game/simulation';
import { CHECK_BY_ID } from '@shared/game/checks';
import { SuggestionCard } from './SuggestionCard';
import type { ApplyResult } from '../behavior/useDatasetSuggestions';

interface ResultsPanelProps {
  outcome: SimOutcome | null;
  stopAtCheckId: string;
  softlockReport: SoftlockReport | null;
  suggestions: DatasetSuggestion[];
  canApplyCheck: boolean;
  onOpenLog: () => void;
  onApply: (suggestion: DatasetSuggestion) => Promise<ApplyResult>;
}

type BannerTone = 'success' | 'danger';

const resolveStopName = (stopAtCheckId: string): string =>
  (stopAtCheckId ? CHECK_BY_ID.get(stopAtCheckId)?.name : undefined) ?? stopAtCheckId ?? 'stop check';

const bannerFor = (outcome: SimOutcome, stopAtCheckId: string): { tone: BannerTone; icon: string; title: string; detail: string } => {
  switch (outcome) {
    case 'stopped-at-check':
      return { tone: 'success', icon: '✓', title: 'Success', detail: `Reached ${resolveStopName(stopAtCheckId)}` };
    case 'completed':
      return { tone: 'success', icon: '✓', title: 'Success', detail: 'All checks complete — goal reached' };
    case 'not-completable':
      return { tone: 'danger', icon: '✕', title: 'Not completable', detail: 'The frontier exhausted with checks still blocked' };
  }
};

const SoftlockSummary = (props: { report: SoftlockReport }) => {
  const { report } = props;
  return (
    <Box className="simulator__softlock">
      <Text className="simulator__softlock-line">{report.completed.length} checks completed.</Text>
      <Text className="simulator__softlock-line">{report.blocked.length} checks left blocked.</Text>
      <Text className="simulator__softlock-line">{report.unreachedScreens.length} screens never reached.</Text>
    </Box>
  );
};

const ResultsPanel = (props: ResultsPanelProps) => {
  const { outcome, stopAtCheckId, softlockReport, suggestions, canApplyCheck, onOpenLog, onApply } = props;
  if (!outcome) return null;

  const banner = bannerFor(outcome, stopAtCheckId);

  return (
    <Box className="simulator__results">
      <Box className="simulator__results-banner">
        <Box className={`simulator__banner simulator__banner--${banner.tone}`}>
          <Text className="simulator__banner-icon">{banner.icon}</Text>
          <Box className="simulator__banner-text">
            <Text className="simulator__banner-title">{banner.title}</Text>
            <Text className="simulator__banner-detail">{banner.detail}</Text>
          </Box>
        </Box>
        <Button size="sm" variant="tertiary" onClick={onOpenLog}>Open log</Button>
      </Box>

      {outcome === 'not-completable' && softlockReport && <SoftlockSummary report={softlockReport} />}

      <Box className="simulator__suggestions">
        <Text className="simulator__suggestions-title">Suggested updates ({suggestions.length})</Text>
        {suggestions.length === 0 && (
          <Text className="simulator__suggestions-empty">No dataset changes suggested.</Text>
        )}
        {suggestions.map((suggestion, i) => (
          <SuggestionCard
            key={`${suggestion.kind}-${suggestion.targetId ?? i}`}
            suggestion={suggestion}
            canApplyCheck={canApplyCheck}
            onApply={onApply}
          />
        ))}
      </Box>
    </Box>
  );
};

export { ResultsPanel };

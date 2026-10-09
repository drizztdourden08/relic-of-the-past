/* @layer renderer-widgets @kind component */
import { Box, Button, Text } from '@drizztdourden08/tessera/primitives';
import { SuggestionCard } from './SuggestionCard';
import { SoftlockSummary } from './SoftlockSummary';
import { outcomeBanner } from '../behavior/outcome-banner';
import type { ResultsPanelProps } from '../SimulatorWidget.type';

const ResultsPanel = (props: ResultsPanelProps) => {
  const { outcome, stopAtCheckId, softlockReport, suggestions, canApplyCheck, onOpenLog, onApply } = props;
  if (!outcome) return null;

  const banner = outcomeBanner(outcome, stopAtCheckId);

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
        <Button size="sm" variant="tertiary" onClick={onOpenLog}>Reveal log file</Button>
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

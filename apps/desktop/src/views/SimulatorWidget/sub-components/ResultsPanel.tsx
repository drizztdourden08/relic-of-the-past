/* @layer renderer-widgets @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Box, Button, Icon, Text } from '@drizztdourden08/tessera/primitives';
import { SuggestionCard } from './SuggestionCard';
import { SoftlockSummary } from './SoftlockSummary';
import { outcomeBanner } from '../behavior/outcome-banner';
import type { ResultsPanelProps } from '../SimulatorWidget.type';

const ResultsPanel = (props: ResultsPanelProps) => {
  const { outcome, stopAtCheckId, softlockReport, suggestions, canApplyCheck, onOpenLog, onApply } = props;
  const t = useT();
  if (!outcome) return null;

  const banner = outcomeBanner(t, outcome, stopAtCheckId);

  return (
    <Box className="simulator__results">
      <Box className="simulator__results-banner">
        <Box className={`simulator__banner simulator__banner--${banner.tone}`}>
          <Icon className="simulator__banner-icon" name={banner.icon} />
          <Box className="simulator__banner-text">
            <Text className="simulator__banner-title">{banner.title}</Text>
            <Text className="simulator__banner-detail">{banner.detail}</Text>
          </Box>
        </Box>
        <Button size="sm" variant="tertiary" onClick={onOpenLog}>{t('views-simulator:results.reveal.log')}</Button>
      </Box>

      {outcome === 'not-completable' && softlockReport && <SoftlockSummary report={softlockReport} />}

      <Box className="simulator__suggestions">
        <Text className="simulator__suggestions-title">{t('views-simulator:results.suggestions.title', { count: suggestions.length })}</Text>
        {suggestions.length === 0 && (
          <Text className="simulator__suggestions-empty">{t('views-simulator:results.suggestions.empty')}</Text>
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

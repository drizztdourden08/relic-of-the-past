/* @layer renderer-widgets @kind component */
import { useState } from 'react';
import { useT } from '@drizztdourden08/brock-react';
import { Box, Status, Button, Text, Tooltip } from '@drizztdourden08/tessera/primitives';
import { applyLabel } from '../behavior/apply-label';
import type { ApplyState, SuggestionCardProps } from '../SimulatorWidget.type';

const SuggestionCard = (props: SuggestionCardProps) => {
  const { suggestion, canApplyCheck, onApply } = props;
  const t = useT();
  const [state, setState] = useState<ApplyState>('idle');
  const [error, setError] = useState<string | null>(null);

  const kindLabels = {
    check: t('views-simulator:suggestion.kind.check'), connection: t('views-simulator:suggestion.kind.connection'),
    screen: t('views-simulator:suggestion.kind.screen'),
  };
  const checkBlocked = suggestion.kind === 'check' && !canApplyCheck;
  const disabled = state === 'applying' || state === 'applied' || checkBlocked;

  const handleApply = async () => {
    setState('applying');
    setError(null);
    const result = await onApply(suggestion);
    if (result.success) {
      setState('applied');
    } else {
      setState('error');
      setError(result.error ?? t('views-simulator:apply.error.failed'));
    }
  };

  const button = (
    <Button size="sm" variant="secondary" onClick={handleApply} disabled={disabled}>
      {applyLabel(t, state)}
    </Button>
  );

  return (
    <Box className="simulator__suggestion">
      <Box className="simulator__suggestion-head">
        <Status tone={suggestion.kind === 'check' ? 'warning' : 'neutral'}>{kindLabels[suggestion.kind]}</Status>
        <Text className="simulator__suggestion-file">{suggestion.targetFile}</Text>
      </Box>
      <Text className="simulator__suggestion-reason">{suggestion.reason}</Text>
      <Box as="pre" className="simulator__suggestion-code">{suggestion.code}</Box>
      <Box className="simulator__suggestion-actions">
        {checkBlocked ? <Tooltip content={t('views-simulator:apply.error.disabled')}>{button}</Tooltip> : button}
        {state === 'error' && error && <Text className="simulator__suggestion-error">{error}</Text>}
      </Box>
    </Box>
  );
};

export { SuggestionCard };

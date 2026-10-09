/* @layer renderer-widgets @kind component */
import { useState } from 'react';
import { Box, Status, Button, Text, Tooltip } from '@drizztdourden08/tessera/primitives';
import { CHECK_DISABLED_HINT } from '../SimulatorWidget.constants';
import type { ApplyState, SuggestionCardProps } from '../SimulatorWidget.type';

const SuggestionCard = (props: SuggestionCardProps) => {
  const { suggestion, canApplyCheck, onApply } = props;
  const [state, setState] = useState<ApplyState>('idle');
  const [error, setError] = useState<string | null>(null);

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
      setError(result.error ?? 'Failed to apply suggestion.');
    }
  };

  const button = (
    <Button size="sm" variant="secondary" onClick={handleApply} disabled={disabled}>
      {state === 'applied' ? 'Applied' : state === 'applying' ? 'Applying...' : 'Apply'}
    </Button>
  );

  return (
    <Box className="simulator__suggestion">
      <Box className="simulator__suggestion-head">
        <Status tone={suggestion.kind === 'check' ? 'warning' : 'neutral'}>{suggestion.kind}</Status>
        <Text className="simulator__suggestion-file">{suggestion.targetFile}</Text>
      </Box>
      <Text className="simulator__suggestion-reason">{suggestion.reason}</Text>
      <Box as="pre" className="simulator__suggestion-code">{suggestion.code}</Box>
      <Box className="simulator__suggestion-actions">
        {checkBlocked ? <Tooltip content={CHECK_DISABLED_HINT}>{button}</Tooltip> : button}
        {state === 'error' && error && <Text className="simulator__suggestion-error">{error}</Text>}
      </Box>
    </Box>
  );
};

export { SuggestionCard };

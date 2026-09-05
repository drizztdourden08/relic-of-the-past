/* @layer renderer-widgets @kind component */
/**
 * One dataset suggestion: kind badge, the observed reason, a code block ready to
 * write, and an Apply button that routes through the screen-editor writer IPC.
 */
import { useState } from 'react';
import { Box, Badge, Button, Text, Tooltip } from '@ds/primitives';
import type { DatasetSuggestion } from '@shared/game/simulation';
import type { ApplyResult } from '../behavior/useDatasetSuggestions';

interface SuggestionCardProps {
  suggestion: DatasetSuggestion;
  canApplyCheck: boolean;
  onApply: (suggestion: DatasetSuggestion) => Promise<ApplyResult>;
}

type ApplyState = 'idle' | 'applying' | 'applied' | 'error';

const CHECK_DISABLED_HINT = 'Check writing is not available in this build.';

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
        <Badge variant={suggestion.kind === 'check' ? 'warning' : 'neutral'}>{suggestion.kind}</Badge>
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

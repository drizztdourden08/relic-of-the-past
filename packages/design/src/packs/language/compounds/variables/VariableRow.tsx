/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { Status, Box, IconButton, Text } from '@drizztdourden08/tessera/primitives';
import { VariableValue } from './VariableValue';
import { KIND_WORDS } from './variables.constants';
import type { VariableRowProps } from './variables.type';

const VariableRow = (props: VariableRowProps) => {
  const { variable, used, onChangeValue, onRemove } = props;

  const handleRemove = useCallback(() => onRemove?.(variable.key), [variable.key, onRemove]);

  return (
    <Box className="variable-row">
      <Text as="span" className="variable-row__key">{variable.key}</Text>
      <Status tone="neutral" className="variable-row__kind">{KIND_WORDS[variable.kind]}</Status>

      <VariableValue variable={variable} onChangeValue={onChangeValue} />

      <Text as="span" className="variable-row__used" title={`${used} entries reference this`}>
        {`${used}×`}
      </Text>

      {variable.locked ? (
        <Status tone="warning" className="variable-row__locked">locked</Status>
      ) : (
        <Box className="variable-row__locked" />
      )}

      {onRemove && !variable.locked ? (
        <IconButton
          variant="danger"
          size="sm"
          label={`Remove ${variable.key}`}
          onClick={handleRemove}
        >
          ✕
        </IconButton>
      ) : (
        <Box className="variable-row__spacer" />
      )}
    </Box>
  );
};

export { VariableRow };

/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { Badge, Box, IconButton, Text, TextInput } from '@ds/primitives';
import { KIND_WORDS } from './variables.constants';
import type { ChangeEvent } from 'react';
import type { VariableRowProps } from './variables.type';

const VariableRow = (props: VariableRowProps) => {
  const { variable, used, onChangeValue, onRemove } = props;

  const handleValue = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    onChangeValue?.(variable, event.currentTarget.value);
  }, [variable, onChangeValue]);

  const handleRemove = useCallback(() => onRemove?.(variable.key), [variable.key, onRemove]);

  return (
    <Box className="variable-row">
      <Text as="span" className="variable-row__key">{variable.key}</Text>
      <Badge variant="neutral" className="variable-row__kind">{KIND_WORDS[variable.kind]}</Badge>

      {variable.locked ? (
        <Text as="span" className="variable-row__note">
          {variable.note ?? 'the running game supplies this value'}
        </Text>
      ) : !onChangeValue ? (
        <Text as="span" className="variable-row__value">{variable.value ?? ''}</Text>
      ) : (
        <TextInput
          className="variable-row__value"
          value={variable.value ?? ''}
          onChange={handleValue}
        />
      )}

      <Text as="span" className="variable-row__used" title={`${used} entries reference this`}>
        {`${used}×`}
      </Text>

      {variable.locked ? (
        <Badge variant="warning" className="variable-row__locked">locked</Badge>
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

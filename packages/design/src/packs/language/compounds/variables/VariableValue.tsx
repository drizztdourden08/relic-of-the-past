/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { Text, TextInput } from '@drizztdourden08/tessera/primitives';
import type { ChangeEvent } from 'react';
import type { VariableValueProps } from './variables.type';

const VariableValue = (props: VariableValueProps) => {
  const { variable, onChangeValue } = props;

  const handleValue = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    onChangeValue?.(variable, event.currentTarget.value);
  }, [variable, onChangeValue]);

  if (variable.locked) {
    return (
      <Text as="span" className="variable-row__note">
        {variable.note ?? 'the running game supplies this value'}
      </Text>
    );
  }
  if (!onChangeValue) return <Text as="span" className="variable-row__value">{variable.value ?? ''}</Text>;
  return <TextInput className="variable-row__value" value={variable.value ?? ''} onChange={handleValue} />;
};

export { VariableValue };

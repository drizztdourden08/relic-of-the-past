/* @layer renderer-components @kind component */
import { useCallback, useState } from 'react';
import { Box, Button, TextInput } from '@drizztdourden08/tessera/primitives';
import type { ChangeEvent } from 'react';
import type { AddTermFormProps } from './variables.type';

const AddTermForm = (props: AddTermFormProps) => {
  const { onAddTerm } = props;

  const [draftKey, setDraftKey] = useState('');
  const [draftValue, setDraftValue] = useState('');

  const canAdd = draftKey.trim().length > 0 && draftValue.trim().length > 0;

  const handleKey = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setDraftKey(event.currentTarget.value);
  }, []);

  const handleValue = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setDraftValue(event.currentTarget.value);
  }, []);

  const handleAdd = useCallback(() => {
    if (!canAdd) return;
    onAddTerm({ key: draftKey.trim(), value: draftValue.trim() });
    setDraftKey('');
    setDraftValue('');
  }, [canAdd, draftKey, draftValue, onAddTerm]);

  return (
    <Box className="variables-table__add">
      <TextInput
        className="variables-table__add-key"
        placeholder="new term key"
        value={draftKey}
        onChange={handleKey}
      />
      <TextInput
        className="variables-table__add-value"
        placeholder="its text"
        value={draftValue}
        onChange={handleValue}
      />
      <Button variant="secondary" size="sm" disabled={!canAdd} onClick={handleAdd}>Add term</Button>
    </Box>
  );
};

export { AddTermForm };

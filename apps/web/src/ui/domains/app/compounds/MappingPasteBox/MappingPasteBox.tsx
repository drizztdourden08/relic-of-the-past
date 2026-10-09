/* @layer renderer-components @kind component */
import { useCallback, useState } from 'react';
import { Box, Text, Button, TextInput, Field } from '@drizztdourden08/tessera/primitives';
import { HINT, STATUS_TEXT } from './MappingPasteBox.constants';
import type { MappingPasteBoxProps, SubmitStatus } from './MappingPasteBox.type';
import './MappingPasteBox.css';

const MappingPasteBox = (props: MappingPasteBoxProps) => {
  const { onSubmit } = props;
  const [value, setValue] = useState('');
  const [status, setStatus] = useState<SubmitStatus>('idle');

  const handleSubmit = useCallback(() => {
    const mapping = value.trim();
    if (!mapping) return;
    setStatus('submitting');
    onSubmit(mapping).then((ok) => {
      setStatus(ok ? 'success' : 'error');
      if (ok) setValue('');
    });
  }, [value, onSubmit]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    setStatus('idle');
  }, []);

  return (
    <Box className="mapping-paste-box">
      <Field label="Paste a mapping line" hint={HINT}>
        <Box className="mapping-paste-box__row">
          <TextInput
            className="mapping-paste-box__input"
            value={value}
            onChange={handleChange}
            placeholder="03000000... = SDL mapping line"
          />
          <Button variant="secondary" size="sm" onClick={handleSubmit} disabled={!value.trim() || status === 'submitting'}>
            Add
          </Button>
        </Box>
      </Field>
      {(status === 'success' || status === 'error') && (
        <Text className={`mapping-paste-box__status mapping-paste-box__status--${status}`}>
          {STATUS_TEXT[status]}
        </Text>
      )}
    </Box>
  );
};

export { MappingPasteBox };

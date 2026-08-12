/* @layer renderer-components @kind component */
/**
 * MappingPasteBox — lets a user paste an SDL mapping line for a controller
 * that isn't recognized, instead of running the calibration wizard. Owns
 * only its own input text and submit status; the actual IPC call happens in
 * whatever View wires `onSubmit` (see UnavailableControllerNotice's callers).
 */
import { useCallback, useState } from 'react';
import { Box } from '../../../../design-system/primitives/Box';
import { Text } from '../../../../design-system/primitives/Text';
import { Button } from '../../../../design-system/primitives/Button';
import { TextInput } from '../../../../design-system/primitives/TextInput';
import { Field } from '../../../../design-system/primitives/Field';
import type { MappingPasteBoxProps, SubmitStatus } from './MappingPasteBox.type';
import './MappingPasteBox.css';

const HINT = 'Get a mapping line from the SDL Gamepad Tool or a community controller database.';

const STATUS_TEXT: Record<'success' | 'error', string> = {
  success: 'Mapping added — the controller should pick it up now.',
  error: "That line wasn't recognized as a valid mapping.",
};

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

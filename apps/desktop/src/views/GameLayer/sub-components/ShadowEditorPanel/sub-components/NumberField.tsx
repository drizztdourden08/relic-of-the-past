/* @layer renderer-components @kind component */
import { TextInput, Box, Text } from '@drizztdourden08/tessera/primitives';
import { useNumberFieldEditing } from '../behavior/useNumberFieldEditing';
import { useNumberFieldScrub } from '../behavior/useNumberFieldScrub';
import type { NumberFieldProps } from './NumberField.type';
import './NumberField.css';

const NumberField = ({ value, onChange, label, icon, min, max, step = 1, suffix }: NumberFieldProps) => {
  const edit = useNumberFieldEditing({ value, min, max, onChange });
  const scrub = useNumberFieldScrub({ value, step, editing: edit.editing, min, max, onChange });
  const caption = icon ?? label;
  const displayValue = suffix ? `${Math.round(value)}${suffix}` : String(Math.round(value * 100) / 100);

  return (
    <Box className="number-field">
      {caption ? <Text className="number-field__label">{caption}</Text> : null}
      {edit.editing ? (
        <TextInput
          ref={edit.inputRef}
          className="number-field__input"
          value={edit.text}
          onChange={edit.handleTextChange}
          onBlur={edit.commit}
          onKeyDown={edit.handleKeyDown}
        />
      ) : (
        <Text
          className="number-field__value"
          onDoubleClick={edit.startEdit}
          onPointerDown={scrub.onPointerDown}
          onPointerMove={scrub.onPointerMove}
          onPointerUp={scrub.onPointerUp}
        >
          {displayValue}
        </Text>
      )}
    </Box>
  );
};

export { NumberField };

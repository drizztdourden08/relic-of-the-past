/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { Box, ProgressBar, Text, TextInput } from '@ds/primitives';
import { fitOf } from './fit-of';
import { offAlphabet } from './off-alphabet';
import { ALPHABET_CAUTION } from './TextSlotRow.constants';
import type { ChangeEvent } from 'react';
import type { TextSlotRowProps } from './TextSlotRow.type';
import './TextSlotRow.css';

const TextSlotRow = (props: TextSlotRowProps) => {
  const { slot, value, readOnly = false, onChangeValue } = props;

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    onChangeValue(slot.key, event.currentTarget.value);
  }, [slot.key, onChangeValue]);

  const fit = fitOf(slot.limit, value);
  const overAlphabet = offAlphabet(slot, value);

  return (
    <Box className="text-slot-row">
      <Text as="span" className="text-slot-row__label" title={slot.key}>{slot.label}</Text>

      <Box className="text-slot-row__fit">
        {fit && (
          <>
            <Text
              as="span"
              className="text-slot-row__count"
              data-level={fit.variant}
              title={fit.detail}
            >
              {fit.readout}
            </Text>
            <ProgressBar
              className="text-slot-row__meter"
              value={fit.used}
              max={fit.max}
              variant={fit.variant}
            />
          </>
        )}
      </Box>

      <TextInput
        className="text-slot-row__input"
        value={value}
        placeholder={slot.fallback}
        aria-label={slot.label}
        disabled={readOnly}
        onChange={handleChange}
      />

      {value.length > 0 && (
        <Text as="span" className="text-slot-row__fallback" title="The original words">
          {slot.fallback}
        </Text>
      )}

      {overAlphabet && (
        <Text as="span" className="text-slot-row__caution">{ALPHABET_CAUTION}</Text>
      )}

      {slot.note && <Text as="span" className="text-slot-row__note">{slot.note}</Text>}
    </Box>
  );
};

export { TextSlotRow };

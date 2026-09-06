/* @layer renderer-components @kind component */
/**
 * One fixed slot: what it is called, the translator's words for it, the original
 * beside them, and how much of the slot's room those words take.
 *
 * The ORIGINAL is both the field's placeholder and the reference beside it, so
 * an untranslated row reads as the words the surface will actually draw and not
 * as an empty box. Nothing here decides anything: the fit and the caution
 * are read off the value on the way past, and every keystroke is reported up.
 */
import { useCallback } from 'react';
import { Box, ProgressBar, Text, TextInput } from '@ds/primitives';
import { fitOf, offAlphabet } from './text-groups.model';
import type { ChangeEvent } from 'react';
import type { TextSlot } from '@shared/game/language';
import './TextSlotRow.css';

/*
 * Says what the surface can do, not what the translator did wrong. The typed
 * words are fine, they cannot all be drawn here.
 */
const ALPHABET_CAUTION = 'This surface draws letters, digits, spaces and & only. Anything else is left out, so keep to those.';

type TextSlotRowProps = {
  slot: TextSlot;
  /** The translator's words, or '' while the original still stands. */
  value: string;
  onChangeValue: (key: string, value: string) => void;
};

const TextSlotRow = (props: TextSlotRowProps) => {
  const { slot, value, onChangeValue } = props;

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
        onChange={handleChange}
      />

      {/* The original is the field's placeholder until words replace it; then it
          moves below, where it stays available without stealing the width. */}
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
export type { TextSlotRowProps };

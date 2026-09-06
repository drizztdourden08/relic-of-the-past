/* @layer renderer-components @kind hook */
/**
 * One axis' edit-in-flight, the state around the rules in draft-rules.
 *
 * Clamping every keystroke was the other option and it is the wrong one here:
 * with a floor of 10, typing "12" passes through "1", which would snap to "10"
 * and leave the next keystroke building "102". So a keystroke that is already
 * valid goes straight up and anything else waits for the commit. Blur or Enter
 * clamps it into range or drops it.
 */
import { useCallback, useState } from 'react';
import { SETTLED, displayValue, resolveTyped, settleDraft } from './draft-rules';
import type { KeyboardEvent } from 'react';
import type { PositionAxis } from '../PositionInput.type';

interface AxisDraftParams {
  value: number;
  axis: PositionAxis;
  onCommit: (next: number) => void;
}

const useAxisDraft = (params: AxisDraftParams) => {
  const { value, axis, onCommit } = params;
  const [draft, setDraft] = useState<number | null>(SETTLED);

  const handleChange = useCallback(
    (typed: number): void => {
      const outcome = resolveTyped(typed, axis);
      if (outcome.kind === 'hold') {
        setDraft(outcome.draft);
        return;
      }
      setDraft(SETTLED);
      onCommit(outcome.value);
    },
    [axis, onCommit],
  );

  const handleBlur = useCallback((): void => {
    if (draft === SETTLED) return;
    setDraft(SETTLED);
    const settled = settleDraft(draft, axis, value);
    if (settled !== null) onCommit(settled);
  }, [axis, draft, onCommit, value]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>): void => {
      if (event.key === 'Enter') handleBlur();
    },
    [handleBlur],
  );

  return { fieldValue: displayValue(draft, value), handleChange, handleBlur, handleKeyDown };
};

export { useAxisDraft };
export type { AxisDraftParams };

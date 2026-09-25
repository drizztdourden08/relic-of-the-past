/* @layer renderer-components @kind component */
/**
 * A NUMBER IN A NARROW CELL, such as a box-model edge or an extent beside its unit.
 *
 * IT IS A `TextInput`, NOT A `NumberInput`, and that is the whole reason the
 * box model is legible. A `NumberInput` spends 29 px on its spinner column,
 * which in an edge cell is the entire cell: §35.6 measured the four-in-a-row
 * margin spinners at 3 px of typing surface at the 188 px rail and concluded no
 * arrangement of four spinners fits. Dropping the spinner is what gives the
 * digits back. The arrow keys still nudge, so nothing is lost but chrome, and
 * `ExtentField` spends the same 29 px on the unit caret instead.
 *
 * A DRAFT, BECAUSE A MINUS SIGN IS NOT A NUMBER YET. Margins are negative all
 * the time (that is how a sprite hangs outside its box), so a field that
 * refused every unparseable keystroke could never be typed into: `-` and `-1`
 * are both on the way to `-12`. What parses commits; what does not waits.
 *
 * EMPTY CLEARS THE EDGE. That is the same rule as a min/max limit, and the reason a
 * box that was merely looked at does not grow four zeroes.
 *
 * AND THE ARROW KEYS MOVE BY THE EDITOR'S STEP (§56). Every number this cell
 * holds is in HUD pixels (a margin, a padding, a `px` extent), which is
 * exactly the set the `STEP 1 2 4 8` strip was put under the preview for. It
 * was a hard-coded 1, which meant the one control with no spinner was also the
 * one control the strip could not reach.
 */
import { useState } from 'react';
import { TextInput } from '@ds/primitives/TextInput';
import { useEditorStep } from '../behavior/editor-step';
import type { KeyboardEvent } from 'react';

const NUMERAL = /^-?(\d+\.?\d*|\.\d+)$/;

interface NumberCellProps {
  /** Names the field for assistive tech: "margin left". */
  label: string;
  value: number | undefined;
  onChange: (next: number | undefined) => void;
  /** Another section owns this number. Shown, not editable, reason in `title`. */
  readOnly?: boolean;
  title?: string;
  /** States the consequence of leaving it blank: `0` for an edge, `auto` for
   *  an extent. */
  placeholder?: string;
  className: string;
}

const NumberCell = (props: NumberCellProps) => {
  const { label, value, onChange, readOnly = false, title, placeholder = '0', className } = props;
  const [draft, setDraft] = useState<string | null>(null);
  const step = useEditorStep();
  const text = draft ?? (value === undefined ? '' : String(value));

  const put = (next: string): void => {
    setDraft(next);
    if (next.trim() === '') { setDraft(null); onChange(undefined); return; }
    if (NUMERAL.test(next.trim())) { setDraft(null); onChange(Number(next.trim())); }
  };

  const nudge = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
    event.preventDefault();
    put(String((value ?? 0) + (event.key === 'ArrowUp' ? step : -step)));
  };

  return (
    <TextInput
      size="sm"
      className={className}
      inputMode="numeric"
      spellCheck={false}
      readOnly={readOnly}
      title={title}
      aria-label={label}
      placeholder={placeholder}
      value={text}
      onChange={(event) => put(event.target.value)}
      onBlur={() => setDraft(null)}
      onKeyDown={nudge}
    />
  );
};

export { NumberCell };
export type { NumberCellProps };

/* @layer renderer-components @kind component */
import { useState } from 'react';
import { TextInput } from '@drizztdourden08/tessera/primitives';
import { useEditorStep } from '../behavior/editor-step';
import { NUMERAL } from './NumberCell.constants';
import type { KeyboardEvent } from 'react';
import type { NumberCellProps } from './NumberCell.type';

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
export type { NumberCellProps } from './NumberCell.type';

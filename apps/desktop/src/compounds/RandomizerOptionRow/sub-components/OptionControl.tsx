/* @layer renderer-components @kind component */
import { useMemo } from 'react';
import { useText } from '@drizztdourden08/brock-react';
import { Select, Slider, TextInput, Toggle } from '@drizztdourden08/tessera/primitives';
import { ValueTag } from '@drizztdourden08/tessera/composites';
import { readoutOf } from '../behavior/readout-of';
import { EMPTY_CHOICES } from '../RandomizerOptionRow.constants';
import type { OptionControlProps } from '../RandomizerOptionRow.type';

const OptionControl = (props: OptionControlProps) => {
  const { option, value, frozen, readout, onChange } = props;
  const text = useText();

  const selectOptions = useMemo(
    () => (option.choices ?? EMPTY_CHOICES).map((c) => ({ value: c.value, label: text(c.label) })),
    [option.choices, text],
  );

  if (readout) return <ValueTag value={readoutOf(option, value, text)} />;
  if (option.kind === 'toggle') {
    return <Toggle checked={Boolean(value)} onChange={(checked) => onChange?.(checked)} disabled={frozen} />;
  }
  if (option.kind === 'choice') {
    return <Select size="sm" value={String(value)} options={selectOptions} onChange={(next) => onChange?.(next)} disabled={frozen} />;
  }
  if (option.kind === 'range' && option.range !== undefined && !frozen) {
    return (
      <Slider
        value={Number(value)}
        min={option.range.min}
        max={option.range.max}
        step={1}
        disabled={onChange === undefined}
        onChange={(next) => onChange?.(next)}
      />
    );
  }
  return <TextInput type="text" value={String(value)} disabled readOnly />;
};

export { OptionControl };

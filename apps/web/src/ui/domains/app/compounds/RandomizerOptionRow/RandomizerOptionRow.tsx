/* @layer renderer-components @kind component */
import { useMemo } from 'react';
import { Box, Select, Slider, Text, TextInput, Toggle } from '@drizztdourden08/tessera/primitives';
import { OptionDescription } from '../OptionDescription';
import { OptionValueTag, choiceLabelOf } from '../OptionValueTag';
import { PoolImpactCell } from '../PoolImpactCell';
import type { OptionDef, OptionValue } from '@shared/randomizer/world/options.type';
import { EMPTY_CHOICES } from './RandomizerOptionRow.constants';
import type { RandomizerOptionRowProps } from './RandomizerOptionRow.type';
import './RandomizerOptionRow.css';

const readoutOf = (option: OptionDef, value: OptionValue): boolean | string => {
  if (option.kind === 'toggle') return Boolean(value);
  if (option.kind === 'choice') return choiceLabelOf(option.choices ?? EMPTY_CHOICES, String(value));
  return String(value);
};

const tagFor = (option: OptionDef): string | null => {
  if (!option.locked) return null;
  if (option.implementation === 'not-implemented') return 'not in this version';
  if (option.implementation === 'not-applicable') return 'not used here';
  return 'fixed';
};

const RandomizerOptionRow = (props: RandomizerOptionRowProps) => {
  const { option, value, onChange, impact, disabled = false, note, readout = false } = props;
  const frozen = option.locked || disabled;
  const forced = note !== undefined && note !== '';

  const selectOptions = useMemo(
    () => (option.choices ?? EMPTY_CHOICES).map((c) => ({ value: c.value, label: c.label })),
    [option.choices],
  );

  const tag = tagFor(option);

  const control = readout ? (
    <OptionValueTag value={readoutOf(option, value)} />
  ) : option.kind === 'toggle' ? (
    <Toggle
      checked={Boolean(value)}
      onChange={(checked) => onChange?.(checked)}
      disabled={frozen}
    />
  ) : option.kind === 'choice' ? (
    <Select
      size="sm"
      value={String(value)}
      options={selectOptions}
      onChange={(next) => onChange?.(next)}
      disabled={frozen}
    />
  ) : option.kind === 'range' && option.range !== undefined && !frozen ? (
    <Slider
      value={Number(value)}
      min={option.range.min}
      max={option.range.max}
      step={1}
      disabled={frozen || onChange === undefined}
      onChange={(next) => onChange?.(next)}
    />
  ) : (
    <TextInput type="text" value={String(value)} disabled readOnly />
  );

  return (
    <Box className={`rand-opt-row${frozen ? ' rand-opt-row--locked' : ''}${forced ? ' rand-opt-row--forced' : ''}`}>
      <Box className="rand-opt-row__text">
        <Box className="rand-opt-row__title">
          <Text className="rand-opt-row__label">{option.displayName}</Text>
          {tag != null && <Text className="rand-opt-row__tag">{tag}</Text>}
        </Box>
        <OptionDescription
          className="rand-opt-row__description"
          description={option.details ?? option.description}
        />
        {forced && <Text className="rand-opt-row__note">{note}</Text>}
      </Box>
      <Box className="rand-opt-row__control">{control}</Box>
      {impact !== undefined ? <PoolImpactCell cell={impact} /> : <Box />}
    </Box>
  );
};

export { RandomizerOptionRow };
export type { RandomizerOptionRowProps };

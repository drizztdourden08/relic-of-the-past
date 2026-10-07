/* @layer renderer-components @kind component */
/**
 * One row of the randomizer options panel: name with a status tag, the
 * catalog's short line under it when it has one (nothing when it does not),
 * the control showing the frozen or chosen value, and the In Pool cell. The
 * three sit on the catalog's fixed grid, so a value that changes width never
 * moves the control. Locked rows render their control disabled at reduced
 * opacity; the tag says why.
 *
 * A row the CATALOG leaves open can still be frozen by the panel showing it,
 * a setting another choice has taken out of the player's hands. It wears the
 * same greyed presentation but keeps its own tag, and a `note` beside it says
 * which setting decided it. The note reads in the blocking colour and the row
 * keeps full contrast: the value shown is the value the seed is built with.
 */
import { useMemo } from 'react';
import { Box, Select, Slider, Text, TextInput, Toggle } from '@ds/primitives';
import { OptionDescription } from '../OptionDescription';
import { PoolImpactCell } from '../PoolImpactCell';
import type { ImpactCell } from '../PoolImpactCell';
import type { ApOptionDef, ApOptionValue } from '@shared/randomizer/ap-world/options.type';
import './RandomizerOptionRow.css';

interface RandomizerOptionRowProps {
  option: ApOptionDef;
  value: ApOptionValue;
  onChange?: (value: ApOptionValue) => void;
  /** The In Pool cell, worded; omitted when the panel has no accounting to show. */
  impact?: ImpactCell;
  /** The panel freezes this row although the catalog leaves it open. */
  disabled?: boolean;
  /** Why a sibling setting overruled this row; shown under it in the blocking colour. */
  note?: string;
}

const EMPTY_CHOICES: ApOptionDef['choices'] = [];

const tagFor = (option: ApOptionDef): string | null => {
  if (!option.locked) return null;
  if (option.implementation === 'not-implemented') return 'not in this version';
  if (option.implementation === 'not-applicable') return 'not used here';
  return 'fixed';
};

const RandomizerOptionRow = (props: RandomizerOptionRowProps) => {
  const { option, value, onChange, impact, disabled = false, note } = props;
  const frozen = option.locked || disabled;
  const forced = note !== undefined && note !== '';

  const selectOptions = useMemo(
    () => (option.choices ?? EMPTY_CHOICES).map((c) => ({ value: c.value, label: c.label })),
    [option.choices],
  );

  const tag = tagFor(option);

  const control = option.kind === 'toggle' ? (
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
    // The frozen run view passes no handler, so the same slider reads the
    // recorded value without offering a drag that could not be saved.
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

/* @layer renderer-components @kind component */
/**
 * The opened-slot count, drawn as whatever it honestly is: a slider in the
 * modes that take a number out of the ticked set, a plain labelled figure in
 * the ones where the ticks alone decide it.
 *
 * Presentational only: which of the two it is arrives already decided
 * (behavior/shop-count-control.ts), so this file is the two shapes and
 * nothing else.
 */
import { Box, Slider, StatRow, Text } from '@ds/primitives';
import { shopCountControlOf } from '../behavior/shop-count-control';
import { SLOT_COUNT_LABEL } from '../ShopSlotsBlock.constants';
import type { ShopScopeSummary } from '../behavior/shop-scope-edits';
import './ShopSlotCount.css';

interface ShopSlotCountProps {
  summary: ShopScopeSummary;
  /** Vanilla mode or a read-only render: both faces draw inert. */
  disabled: boolean;
  /** Absent renders the control frozen; only the slider face ever calls it. */
  onChange?: (slotCount: number) => void;
}

const ShopSlotCount = (props: ShopSlotCountProps) => {
  const { summary, disabled, onChange } = props;
  const control = shopCountControlOf(summary);

  if (control.kind === 'readout') {
    return (
      <Box className="shop-slot-count" data-inert={disabled ? '' : undefined}>
        <StatRow label={SLOT_COUNT_LABEL} value={control.value} />
        <Text className="shop-slot-count__description">{control.description}</Text>
      </Box>
    );
  }

  return (
    <Slider
      label={SLOT_COUNT_LABEL}
      description={control.description}
      value={control.value}
      min={0}
      max={control.max}
      disabled={disabled || onChange === undefined}
      onChange={(next) => onChange?.(next)}
    />
  );
};

export { ShopSlotCount };
export type { ShopSlotCountProps };

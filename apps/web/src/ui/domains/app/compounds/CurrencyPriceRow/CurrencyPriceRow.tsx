/* @layer renderer-components @kind component */
/**
 * One row of a currency-price section: the checkbox that opts a currency in,
 * and beside it the two-thumb range a rolled price is drawn from, disabled
 * until the currency is ticked. A row may also pass checkboxes in as children:
 * on its own they take the range's place, and under a range they fall to a
 * line of their own across the row, so the tick and its range stay together on
 * the first line whatever the row carries below.
 *
 * A row a rule elsewhere on the panel has taken away is BLOCKED: its tick is
 * inert and off, and the one line saying why takes the range's place,
 * so the greying reads as a consequence of another setting instead of as
 * this row's own choice.
 */
import { Box, Checkbox, RangeSlider, Text } from '@ds/primitives';
import './CurrencyPriceRow.css';

interface CurrencyPriceRowProps {
  label: string;
  enabled: boolean;
  onEnabledChange?: (enabled: boolean) => void;
  /** A rule elsewhere holds this currency off: the tick cannot be changed. */
  blocked?: boolean;
  /** Why the row is blocked; shown in the control's place while it is. */
  note?: string;
  /** The discrete amounts both thumbs sit on; omitted for the bottle row. */
  stops?: readonly string[];
  /** [low, high] indexes into `stops`. */
  range?: readonly [number, number];
  onRangeChange?: (next: [number, number]) => void;
  children?: React.ReactNode;
}

const CurrencyPriceRow = (props: CurrencyPriceRowProps) => {
  const {
    label, enabled, onEnabledChange, blocked = false, note = '',
    stops, range, onRangeChange, children,
  } = props;
  const readOnly = onEnabledChange === undefined;

  const control = blocked && note !== '' ? (
    <Text className="currency-price-row__note">{note}</Text>
  ) : stops !== undefined && range !== undefined ? (
    <RangeSlider
      stops={stops}
      value={range}
      disabled={readOnly || !enabled}
      labelEvery={Math.max(1, Math.floor(stops.length / 5))}
      ariaLabel={`${label} price range`}
      onChange={(next) => onRangeChange?.(next)}
    />
  ) : undefined;

  return (
    <Box
      className={`currency-price-row${enabled ? '' : ' currency-price-row--off'}`}
      data-blocked={blocked ? '' : undefined}
    >
      <Checkbox
        checked={enabled}
        disabled={readOnly || blocked}
        onChange={(next) => onEnabledChange?.(next)}
        label={label}
      />
      {control ?? <Box className="currency-price-row__contents">{children}</Box>}
      {control !== undefined && children !== undefined && (
        <Box className="currency-price-row__contents currency-price-row__contents--below">{children}</Box>
      )}
    </Box>
  );
};

export { CurrencyPriceRow };
export type { CurrencyPriceRowProps };

/* @layer renderer-components @kind component */
/**
 * One row of the shop-price section: the checkbox that opts a currency in,
 * and beside it the two-thumb range a rolled price is drawn from, disabled
 * until the currency is ticked. The bottle row has no range; it passes its
 * content checkboxes in as children and they sit in the same place.
 *
 * A row a rule elsewhere on the panel has taken away is BLOCKED: its tick is
 * inert as well as off, and the one line saying why takes the range's place,
 * so the greying reads as a consequence of another setting rather than as
 * this row's own choice.
 */
import { Box, Checkbox, RangeSlider, Text } from '@ds/primitives';
import './ShopPriceRow.css';

interface ShopPriceRowProps {
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

const ShopPriceRow = (props: ShopPriceRowProps) => {
  const {
    label, enabled, onEnabledChange, blocked = false, note = '',
    stops, range, onRangeChange, children,
  } = props;
  const readOnly = onEnabledChange === undefined;

  const control = blocked && note !== '' ? (
    <Text className="shop-price-row__note">{note}</Text>
  ) : stops !== undefined && range !== undefined ? (
    <RangeSlider
      stops={stops}
      value={range}
      disabled={readOnly || !enabled}
      labelEvery={Math.max(1, Math.floor(stops.length / 5))}
      ariaLabel={`${label} price range`}
      onChange={(next) => onRangeChange?.(next)}
    />
  ) : (
    <Box className="shop-price-row__contents">{children}</Box>
  );

  return (
    <Box
      className={`shop-price-row${enabled ? '' : ' shop-price-row--off'}`}
      data-blocked={blocked ? '' : undefined}
    >
      <Checkbox
        checked={enabled}
        disabled={readOnly || blocked}
        onChange={(next) => onEnabledChange?.(next)}
        label={label}
      />
      {control}
    </Box>
  );
};

export { ShopPriceRow };
export type { ShopPriceRowProps };

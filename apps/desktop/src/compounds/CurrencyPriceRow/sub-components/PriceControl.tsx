/* @layer renderer-components @kind component */
import { Slider, Text } from '@drizztdourden08/tessera/primitives';
import { OptionValueTag, rangeLabelOf } from '../../OptionValueTag';
import type { PriceControlProps } from '../CurrencyPriceRow.type';

const PriceControl = (props: PriceControlProps) => {
  const { label, enabled, readOnly, blocked, note, stops, range, readout, onRangeChange } = props;

  if (blocked && note !== '') return <Text className="currency-price-row__note">{note}</Text>;
  if (stops === undefined || range === undefined) return null;
  if (readout) return <OptionValueTag value={rangeLabelOf(stops, range)} />;

  return (
    <Slider
      range
      stops={stops}
      value={range}
      disabled={readOnly || !enabled}
      labels={`every ${Math.max(1, Math.floor(stops.length / 5))}`}
      showValue={false}
      aria-label={`${label} price range`}
      onChange={(next) => onRangeChange?.(next)}
    />
  );
};

export { PriceControl };

/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Slider, Text } from '@drizztdourden08/tessera/primitives';
import { ValueTag } from '@drizztdourden08/tessera/composites';
import { rangeLabelOf } from '@app/hooks/randomizer/option-labels';
import type { PriceControlProps } from '../CurrencyPriceRow.type';

const PriceControl = (props: PriceControlProps) => {
  const t = useT();
  const { label, enabled, readOnly, blocked, note, stops, range, readout, onRangeChange } = props;

  if (blocked && note !== '') return <Text className="currency-price-row__note">{note}</Text>;
  if (stops === undefined || range === undefined) return null;
  if (readout) return <ValueTag value={rangeLabelOf(stops, range)} />;

  return (
    <Slider
      range
      stops={stops}
      value={range}
      disabled={readOnly || !enabled}
      labels={t('compounds:price-control.every', { step: Math.max(1, Math.floor(stops.length / 5)) })}
      showValue={false}
      aria-label={t('compounds:price-control.range-aria', { label })}
      onChange={(next) => onRangeChange?.(next)}
    />
  );
};

export { PriceControl };

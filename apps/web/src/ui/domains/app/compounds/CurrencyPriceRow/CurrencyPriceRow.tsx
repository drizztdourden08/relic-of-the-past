/* @layer renderer-components @kind component */
import { Box, Checkbox, Slider, Text } from '@drizztdourden08/tessera/primitives';
import { OptionValueTag, rangeLabelOf } from '../OptionValueTag';
import type { CurrencyPriceRowProps } from './CurrencyPriceRow.type';
import './CurrencyPriceRow.css';

const CurrencyPriceRow = (props: CurrencyPriceRowProps) => {
  const {
    label, enabled, onEnabledChange, blocked = false, note = '',
    stops, range, onRangeChange, readout = false, children,
  } = props;
  const readOnly = onEnabledChange === undefined;

  const control = blocked && note !== '' ? (
    <Text className="currency-price-row__note">{note}</Text>
  ) : stops !== undefined && range !== undefined && readout ? (
    <OptionValueTag value={rangeLabelOf(stops, range)} />
  ) : stops !== undefined && range !== undefined ? (
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
  ) : undefined;

  return (
    <Box
      className={`currency-price-row${enabled ? '' : ' currency-price-row--off'}`}
      data-blocked={blocked ? '' : undefined}
    >
      {readout ? <OptionValueTag label={label} value={enabled} /> : (
        <Checkbox
          checked={enabled}
          disabled={readOnly || blocked}
          onChange={(next) => onEnabledChange?.(next)}
          label={label}
        />
      )}
      {control ?? <Box className="currency-price-row__contents">{children}</Box>}
      {control !== undefined && children !== undefined && (
        <Box className="currency-price-row__contents currency-price-row__contents--below">{children}</Box>
      )}
    </Box>
  );
};

export { CurrencyPriceRow };
export type { CurrencyPriceRowProps };

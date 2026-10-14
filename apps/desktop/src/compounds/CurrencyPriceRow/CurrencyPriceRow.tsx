/* @layer renderer-components @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import { hasPriceControl } from './behavior/has-price-control';
import type { CurrencyPriceRowProps } from './CurrencyPriceRow.type';
import { PriceControl } from './sub-components/PriceControl';
import { PriceEnabled } from './sub-components/PriceEnabled';
import './CurrencyPriceRow.css';

const CurrencyPriceRow = (props: CurrencyPriceRowProps) => {
  const {
    label, enabled, onEnabledChange, blocked = false, note = '',
    stops, range, onRangeChange, readout = false, children,
  } = props;
  const readOnly = onEnabledChange === undefined;
  const hasControl = hasPriceControl(blocked, note, stops, range);

  return (
    <Box
      className={`currency-price-row${enabled ? '' : ' currency-price-row--off'}`}
      data-blocked={blocked ? '' : undefined}
    >
      <PriceEnabled label={label} enabled={enabled} readout={readout} disabled={readOnly || blocked} onChange={onEnabledChange} />
      {hasControl
        ? (
          <PriceControl
            label={label} enabled={enabled} readOnly={readOnly} blocked={blocked} note={note}
            stops={stops} range={range} readout={readout} onRangeChange={onRangeChange}
          />
        )
        : <Box className="currency-price-row__contents">{children}</Box>}
      {hasControl && children !== undefined && (
        <Box className="currency-price-row__contents currency-price-row__contents--below">{children}</Box>
      )}
    </Box>
  );
};

export { CurrencyPriceRow };
export type { CurrencyPriceRowProps };

/* @layer renderer-components @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import { BottleContentRow, CurrencyPriceRow, currencyRowsOf } from '../CurrencyPriceRow';
import { RandomizerOptionGroup } from '../RandomizerOptionGroup';
import { ShopPriceModifierRow } from './sub-components/ShopPriceModifierRow';
import { bottleContentRowsOf } from './behavior/bottle-content-rows';
import {
  BOTTLE_KEY, CURRENCY_ROWS, SHOP_PRICE_MODIFIER_DEFAULT, SHOP_PRICE_MODIFIER_KEY,
  SHOP_PRICE_MODIFIER_MAX, SHOP_PRICE_MODIFIER_MIN,
} from '@shared/randomizer/world/shops/shop-price-options.data';
import { SHOP_CURRENCY_KEYS } from './ShopPricesBlock.constants';
import type { ShopPricesBlockProps } from './ShopPricesBlock.type';
import './ShopPricesBlock.css';

const boolAt = (values: ShopPricesBlockProps['values'], key: string): boolean => values[key] === true;
const numberAt = (values: ShopPricesBlockProps['values'], key: string, fallback: number): number =>
  (typeof values[key] === 'number' ? values[key] : fallback);

const ShopPricesBlock = (props: ShopPricesBlockProps) => {
  const { values, capacity, onChange, readout = false } = props;
  const currencyRows = currencyRowsOf(values, capacity, CURRENCY_ROWS, SHOP_CURRENCY_KEYS);
  const bottleRows = bottleContentRowsOf(values);
  const bottleOn = boolAt(values, BOTTLE_KEY);
  const countedOn = currencyRows.some((row) => row.checked);

  return (
    <RandomizerOptionGroup title="Shop prices" live className="shop-prices-block">
      <Box className="shop-prices-block__rows">
        {currencyRows.map((row) => (
          <CurrencyPriceRow
            key={row.currency}
            label={row.label}
            enabled={row.checked}
            blocked={row.blocked}
            note={row.note}
            readout={readout}
            onEnabledChange={onChange === undefined ? undefined : (next) => onChange({ [row.key]: next })}
            stops={row.stops}
            range={row.range}
            onRangeChange={onChange === undefined ? undefined : ([lowIndex, highIndex]) => onChange({
              [row.minKey]: Number(row.stops[lowIndex]),
              [row.maxKey]: Number(row.stops[highIndex]),
            })}
          />
        ))}
        <CurrencyPriceRow
          label="A bottle of something"
          enabled={bottleOn}
          readout={readout}
          onEnabledChange={onChange === undefined ? undefined : (next) => onChange({ [BOTTLE_KEY]: next })}
        >
          {bottleRows.map((row) => (
            <BottleContentRow
              key={row.content}
              row={row}
              disabled={!bottleOn}
              readout={readout}
              onChange={onChange === undefined ? undefined : (next) => onChange({ [row.key]: next })}
            />
          ))}
        </CurrencyPriceRow>
        <ShopPriceModifierRow
          label="Price modifier"
          value={numberAt(values, SHOP_PRICE_MODIFIER_KEY, SHOP_PRICE_MODIFIER_DEFAULT)}
          min={SHOP_PRICE_MODIFIER_MIN}
          max={SHOP_PRICE_MODIFIER_MAX}
          disabled={!countedOn}
          readout={readout}
          onChange={onChange === undefined ? undefined : (next) => onChange({ [SHOP_PRICE_MODIFIER_KEY]: next })}
        />
      </Box>
    </RandomizerOptionGroup>
  );
};

export { ShopPricesBlock };
export type { ShopPricesBlockProps };

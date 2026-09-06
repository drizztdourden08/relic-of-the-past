/* @layer renderer-components @kind component */
/**
 * The "Shop prices" section of an options panel: one row per currency a
 * shelf may charge, each a checkbox with the range its rolled amount is drawn
 * from beside it; the bottle row, a checkbox with the contents a shelf may
 * demand ticked inline; and the percentage every rolled price is scaled by.
 * With nothing ticked no price is rolled and every shelf charges what the
 * unmodified game charges.
 *
 * Shared by the creation panel and the frozen Run tab; the rows arrive
 * derived from the snapshot values, and edits leave keyed by catalog key.
 *
 * Each counted range ends where its currency does: the capacity profile
 * decides how many rupees, arrows and bombs the seed can ever hold and the
 * heart ceiling how many hearts, so the rows read their top off it
 * (behavior/currency-rows) and a range the player cannot pay for cannot be
 * set. The percentage has nothing to scale until a counted currency is
 * ticked, and freezes until one is; a bottle price carries no amount, so it
 * is never scaled.
 *
 * Two rules grey a row from elsewhere on the panel, and each says why on the
 * row it greys: a bottle content whose cauldron went to the shuffle cannot be
 * demanded as a price, and the arrows currency has nothing to pay with once
 * retro bow has taken arrows out of the world. The stored tick is kept, so
 * the choice comes straight back when the rule lets go.
 */
import { Box } from '@ds/primitives';
import { RandomizerOptionGroup } from '../RandomizerOptionGroup';
import { BottleContentRow } from './sub-components/BottleContentRow';
import { ShopPriceModifierRow } from './sub-components/ShopPriceModifierRow';
import { ShopPriceRow } from './sub-components/ShopPriceRow';
import { bottleContentRowsOf } from './behavior/bottle-content-rows';
import { currencyRowsOf } from './behavior/currency-rows';
import {
  BOTTLE_KEY, SHOP_PRICE_MODIFIER_DEFAULT, SHOP_PRICE_MODIFIER_KEY,
  SHOP_PRICE_MODIFIER_MAX, SHOP_PRICE_MODIFIER_MIN,
} from '@shared/randomizer/ap-world/shops/shop-price-options.data';
import type { CapacityProfile } from '@shared/randomizer/ap-world/capacity';
import type { ApOptionValue } from '@shared/randomizer/ap-world/options.type';
import './ShopPricesBlock.css';

interface ShopPricesBlockProps {
  values: Readonly<Record<string, ApOptionValue>>;
  /** The reconciled capacity profile: what each counted range may climb to. */
  capacity: CapacityProfile;
  /**
   * One patch per edit, keyed by catalog key. A patch instead of a single
   * key because the range writes both ends together; two separate calls in
   * the same tick would each build on the pre-edit values and the first end
   * would be lost. Absent renders the section frozen, the Run tab's
   * read-only view.
   */
  onChange?: (patch: Readonly<Record<string, ApOptionValue>>) => void;
}

const boolAt = (values: ShopPricesBlockProps['values'], key: string): boolean => values[key] === true;
const numberAt = (values: ShopPricesBlockProps['values'], key: string, fallback: number): number =>
  (typeof values[key] === 'number' ? values[key] : fallback);

const ShopPricesBlock = (props: ShopPricesBlockProps) => {
  const { values, capacity, onChange } = props;
  const currencyRows = currencyRowsOf(values, capacity);
  const bottleRows = bottleContentRowsOf(values);
  const bottleOn = boolAt(values, BOTTLE_KEY);
  // A percentage of nothing is nothing: with no counted currency in play there
  // is no rolled price for it to scale, so the row is frozen.
  const countedOn = currencyRows.some((row) => row.checked);

  return (
    <RandomizerOptionGroup title="Shop prices" live className="shop-prices-block">
      <Box className="shop-prices-block__rows">
        {currencyRows.map((row) => (
          <ShopPriceRow
            key={row.currency}
            label={row.label}
            enabled={row.checked}
            blocked={row.blocked}
            note={row.note}
            onEnabledChange={onChange === undefined ? undefined : (next) => onChange({ [row.key]: next })}
            stops={row.stops}
            range={row.range}
            onRangeChange={onChange === undefined ? undefined : ([lowIndex, highIndex]) => onChange({
              [row.minKey]: Number(row.stops[lowIndex]),
              [row.maxKey]: Number(row.stops[highIndex]),
            })}
          />
        ))}
        <ShopPriceRow
          label="A bottle of something"
          enabled={bottleOn}
          onEnabledChange={onChange === undefined ? undefined : (next) => onChange({ [BOTTLE_KEY]: next })}
        >
          {bottleRows.map((row) => (
            <BottleContentRow
              key={row.content}
              row={row}
              disabled={!bottleOn}
              onChange={onChange === undefined ? undefined : (next) => onChange({ [row.key]: next })}
            />
          ))}
        </ShopPriceRow>
        <ShopPriceModifierRow
          label="Price modifier"
          value={numberAt(values, SHOP_PRICE_MODIFIER_KEY, SHOP_PRICE_MODIFIER_DEFAULT)}
          min={SHOP_PRICE_MODIFIER_MIN}
          max={SHOP_PRICE_MODIFIER_MAX}
          disabled={!countedOn}
          onChange={onChange === undefined ? undefined : (next) => onChange({ [SHOP_PRICE_MODIFIER_KEY]: next })}
        />
      </Box>
    </RandomizerOptionGroup>
  );
};

export { ShopPricesBlock };
export type { ShopPricesBlockProps };

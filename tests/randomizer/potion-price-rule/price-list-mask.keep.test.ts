/* @layer tests @kind test */
import { describe, expect, it } from 'vitest';
import { blockedContentsOf, potionPriceStateOfValues, reconcilePotionPrices, bottleContentKeyOf, rollShopPrices, shopPricePlanOf, shopSlotLocationsOf, shopScopeOfValues, createRng } from '@rotp/randomizer';
import type { ShopBottleContent } from '@rotp/randomizer';
import { ALL_PRICES, BLOCKED_SCOPE, CAULDRON } from './potion-price-rule.constants';
import { cauldronSubsets } from './cauldron-subsets';
import { combinations } from './combinations';
import { scopeWith } from './scope-with';
import { valuesOf } from './values-of';

describe('a cauldron given to the shuffle takes its potion off the price list', () => {
  it('masks every blocked content row, in every scope the panel can hold', () => {
    for (const { scope, prices } of combinations()) {
      const settled = reconcilePotionPrices({ shops: scope, prices });
      for (const content of settled.blockedContents) {
        expect(settled.prices[bottleContentKeyOf(content)]).toBe(false);
      }
    }
  });

  it('freezes a snapshot whose price plan can never demand a blocked content', () => {
    for (const combination of combinations()) {
      const values = valuesOf(combination);
      const blocked = new Set(blockedContentsOf(shopScopeOfValues(values)));
      const offered = shopPricePlanOf(values).bottle.contents;
      expect(offered.filter((content) => blocked.has(content)), JSON.stringify([...blocked])).toEqual([]);
    }
  });

  it('never rolls a price in a content the file cannot buy back', () => {
    let bottlePrices = 0;
    let blockedSeen = 0;
    for (const combination of combinations()) {
      const values = valuesOf(combination);
      const blocked = new Set(blockedContentsOf(shopScopeOfValues(values)));
      blockedSeen += blocked.size;
      const scope = shopScopeOfValues(values, 'guard-seed');
      const view = rollShopPrices(shopSlotLocationsOf(scope), shopPricePlanOf(values), createRng('guard-seed'));
      for (const price of Object.values(view)) {
        if (price.currency !== 'bottle') continue;
        bottlePrices += 1;
        expect(blocked.has(price.content), `rolled ${price.content}`).toBe(false);
      }
    }
    expect(bottlePrices).toBeGreaterThan(0);
    expect(blockedSeen).toBeGreaterThan(0);
  });

  it('leaves the caught contents alone, so a fairy and a bee are never blocked', () => {
    const catchable: readonly ShopBottleContent[] = ['fairy', 'bee'];
    for (const { scope } of combinations()) {
      const blocked = blockedContentsOf(scope);
      for (const content of catchable) expect(blocked).not.toContain(content);
    }
  });

  it('shuffles nothing in vanilla mode, so every content stays available', () => {
    for (const ticked of cauldronSubsets()) {
      expect(blockedContentsOf(scopeWith(ticked, 'vanilla'))).toEqual([]);
    }
  });
});

describe('the mask is not an overwrite', () => {
  it('gives the row straight back when the cauldron is unticked', () => {
    const key = bottleContentKeyOf(CAULDRON.content);
    expect(valuesOf({ scope: BLOCKED_SCOPE, prices: ALL_PRICES })[key]).toBe(false);
    expect(valuesOf({ scope: scopeWith([], 'custom'), prices: ALL_PRICES })[key]).toBe(true);
  });

  it('greys exactly the blocked rows for the panel, and says why', () => {
    const state = potionPriceStateOfValues(valuesOf({ scope: BLOCKED_SCOPE, prices: ALL_PRICES }));
    expect([...state.blockedKeys]).toEqual([bottleContentKeyOf(CAULDRON.content)]);
    expect(state.notes).toHaveLength(1);
    expect(state.notes[0]).toContain(CAULDRON.label);
  });
});

describe('a snapshot this app did not write', () => {
  it('is refused by the roll instead of trusted', () => {
    const honest = valuesOf({ scope: BLOCKED_SCOPE, prices: ALL_PRICES });
    const tampered = { ...honest, [bottleContentKeyOf(CAULDRON.content)]: true };
    expect(shopPricePlanOf(tampered).bottle.contents).not.toContain(CAULDRON.content);
  });
});

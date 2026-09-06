/* @layer tests @kind test */
/**
 * Guard: no shelf is ever priced in something the file cannot buy back.
 *
 * The hut's three cauldrons are the only repeatable source of potions, and a
 * bottle price CONSUMES its content — a restocked shelf asks again. So a
 * cauldron handed to the shuffle takes its potion out of the game, and any
 * shelf priced in that potion becomes unpayable. This walks every reachable
 * pairing of the shop scope and the price rows and proves the hole is closed
 * three times over: the rule masks the row, the frozen snapshot carries the
 * mask, and the roll itself refuses the content even when a snapshot claims
 * otherwise.
 */
import { describe, expect, it } from 'vitest';
import {
  POTION_CAULDRONS, blockedContentsOf, potionPriceStateOfValues, reconcilePotionPrices,
} from '@shared/randomizer/ap-world/potion-price';
import {
  BOTTLE_CONTENTS, BOTTLE_KEY, bottleContentKeyOf,
} from '@shared/randomizer/ap-world/shops/shop-price-options.data';
import { rollShopPrices, shopPricePlanOf } from '@shared/randomizer/ap-world/shops/shop-price-plan';
import { shopSlotLocationsOf } from '@shared/randomizer/ap-world/shops/shop-slots';
import { defaultShopScope, shopScopeOfValues } from '@shared/randomizer/ap-world/shops/shop-scope-from-values';
import { SHOP_SHUFFLE_MODES } from '@shared/randomizer/ap-world/shops/shop-scope';
import { ruleForPrice } from '@shared/randomizer/ap-world/rules/shop-prices';
import { REGION_NAME } from '@shared/randomizer/ap-world/item-names.data';
import { LEGACY_SHUFFLE_ON_PROFILE } from '@shared/randomizer/ap-world/capacity';
import { DEFAULT_ITEM_POWER } from '@shared/randomizer/ap-world/item-power/item-power.data';
import { defaultProgressiveSetting } from '@shared/randomizer/ap-world/progressive/progressive-from-snapshot';
import { LEGACY_POND_SETTING } from '@shared/randomizer/ap-world/pond/pond-profile-defaults';
import { buildOptionsSnapshot } from '@shared/randomizer/options-snapshot';
import { createRng } from '@shared/randomizer/rng';
import { randomizerChoiceOverrides } from '@app/hooks/randomizer/randomizer-choices';
import { bottleContentRowsOf } from '@app/ui/domains/app/compounds/ShopPricesBlock/behavior/bottle-content-rows';
import type { CollectionState } from '@shared/randomizer/ap-world/collection-state';
import type { ApOptionValue } from '@shared/randomizer/ap-world/options.type';
import type { ShopBottleContent } from '@shared/randomizer/ap-world/shops/shop-price.type';
import type { ShopScope } from '@shared/randomizer/ap-world/shops/shop-scope.type';
import type { RandomizerOptionChoices } from '@app/hooks/randomizer/randomizer-choices';

type Values = Readonly<Record<string, ApOptionValue>>;

const BASE: Omit<RandomizerOptionChoices, 'shops' | 'shopPrices'> = {
  keyDropShuffle: true,
  includeNpcChecks: false,
  includeWorldItems: false,
  shufflePrizes: false,
  capacityEnabled: true,
  capacity: LEGACY_SHUFFLE_ON_PROFILE,
  capacityProgressive: true,
  pond: LEGACY_POND_SETTING,
  progressiveTiers: defaultProgressiveSetting(),
  itemPower: DEFAULT_ITEM_POWER,
};

const contentRows = (on: boolean): Values =>
  Object.fromEntries(BOTTLE_CONTENTS.map(({ content }) => [bottleContentKeyOf(content), on]));

/** Every price row ticked: the choice that exercises the mask hardest. */
const ALL_PRICES: Values = { [BOTTLE_KEY]: true, ...contentRows(true) };
const NO_CONTENTS: Values = { [BOTTLE_KEY]: true, ...contentRows(false) };

const scopeWith = (ticked: readonly number[], mode: ShopScope['mode']): ShopScope => {
  const base = defaultShopScope();
  const enabled = [...new Set([...base.enabled, ...ticked])].sort((a, b) => a - b);
  return { ...base, mode, enabled, slotCount: enabled.length, depth: 2 };
};

/** Every on/off pattern of the three cauldrons. */
const cauldronSubsets = (): number[][] => {
  const all: number[][] = [];
  for (let mask = 0; mask < 2 ** POTION_CAULDRONS.length; mask += 1) {
    all.push(POTION_CAULDRONS
      .filter((_row, index) => (mask & (1 << index)) !== 0)
      .map((row) => row.canonicalIndex));
  }
  return all;
};

interface Combination { scope: ShopScope; prices: Values }

const combinations = (): Combination[] => {
  const all: Combination[] = [];
  for (const mode of SHOP_SHUFFLE_MODES) {
    for (const ticked of cauldronSubsets()) {
      for (const prices of [ALL_PRICES, NO_CONTENTS]) all.push({ scope: scopeWith(ticked, mode), prices });
    }
  }
  return all;
};

const valuesOf = ({ scope, prices }: Combination): Values =>
  buildOptionsSnapshot(randomizerChoiceOverrides({ ...BASE, shops: scope, shopPrices: prices })).values;

const CAULDRON = POTION_CAULDRONS[0];
const BLOCKED_SCOPE = scopeWith([CAULDRON.canonicalIndex], 'custom');

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
    // The guard is worthless if nothing was rolled or nothing was ever blocked.
    expect(bottlePrices).toBeGreaterThan(0);
    expect(blockedSeen).toBeGreaterThan(0);
  });

  it('leaves the caught contents alone — a fairy and a bee are never blocked', () => {
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
    // The choices never lost the tick, so dropping the cauldron restores it.
    expect(valuesOf({ scope: scopeWith([], 'custom'), prices: ALL_PRICES })[key]).toBe(true);
  });

  it('greys exactly the blocked rows for the panel, and says why', () => {
    const state = potionPriceStateOfValues(valuesOf({ scope: BLOCKED_SCOPE, prices: ALL_PRICES }));
    expect([...state.blockedKeys]).toEqual([bottleContentKeyOf(CAULDRON.content)]);
    expect(state.notes).toHaveLength(1);
    expect(state.notes[0]).toContain(CAULDRON.label);
  });
});

describe('each cauldron answers for its own content alone', () => {
  const contentOf = (canonicalIndex: number) =>
    POTION_CAULDRONS.find((row) => row.canonicalIndex === canonicalIndex)!.content;

  it('blocks exactly the one content whose cauldron is ticked', () => {
    for (const cauldron of POTION_CAULDRONS) {
      const scope = scopeWith([cauldron.canonicalIndex], 'custom');
      const state = potionPriceStateOfValues(valuesOf({ scope, prices: ALL_PRICES }));
      expect([...state.blockedContents], cauldron.content).toEqual([cauldron.content]);
      expect([...state.blockedKeys]).toEqual([bottleContentKeyOf(cauldron.content)]);
      // The other two cauldrons keep their contents on offer.
      for (const other of POTION_CAULDRONS) {
        if (other === cauldron) continue;
        expect(state.blockedContents, `${cauldron.content} vs ${other.content}`).not.toContain(other.content);
      }
    }
  });

  it('greys that one price row and leaves the rest of them live', () => {
    for (const cauldron of POTION_CAULDRONS) {
      const scope = scopeWith([cauldron.canonicalIndex], 'custom');
      const rows = bottleContentRowsOf(valuesOf({ scope, prices: ALL_PRICES }));
      const blocked = rows.filter((row) => row.blocked);
      expect(blocked.map((row) => row.content)).toEqual([cauldron.content]);
      expect(blocked[0].note).toContain(cauldron.label);
      expect(blocked[0].checked).toBe(false);
      for (const row of rows.filter((candidate) => !candidate.blocked)) {
        expect(row.note, row.content).toBe('');
        expect(row.checked, row.content).toBe(true);
      }
    }
  });

  it('gives the row back the moment that one cauldron is unticked', () => {
    for (const cauldron of POTION_CAULDRONS) {
      const others = POTION_CAULDRONS
        .filter((row) => row !== cauldron)
        .map((row) => row.canonicalIndex);
      const rows = bottleContentRowsOf(valuesOf({ scope: scopeWith(others, 'custom'), prices: ALL_PRICES }));
      const own = rows.find((row) => row.content === cauldron.content)!;
      expect(own.blocked, cauldron.content).toBe(false);
      expect(own.checked).toBe(true);
      // Row order is the price list's, not the cauldron list's — compare sets.
      expect(new Set(rows.filter((row) => row.blocked).map((row) => row.content)))
        .toEqual(new Set(others.map(contentOf)));
    }
  });

  it('never blocks a content a bottle can be filled with by hand', () => {
    const everyCauldron = POTION_CAULDRONS.map((row) => row.canonicalIndex);
    const rows = bottleContentRowsOf(valuesOf({ scope: scopeWith(everyCauldron, 'custom'), prices: ALL_PRICES }));
    for (const content of ['fairy', 'bee'] as const) {
      expect(rows.find((row) => row.content === content)!.blocked, content).toBe(false);
    }
  });
});

describe('a snapshot this app did not write', () => {
  it('is refused by the roll rather than trusted', () => {
    const honest = valuesOf({ scope: BLOCKED_SCOPE, prices: ALL_PRICES });
    // Hand-edited: the blocked row flipped back on behind the panel's back.
    const tampered = { ...honest, [bottleContentKeyOf(CAULDRON.content)]: true };
    expect(shopPricePlanOf(tampered).bottle.contents).not.toContain(CAULDRON.content);
  });
});

describe('paying a bottle price needs a source to buy the content back from', () => {
  // walletCapacity reads the wallet ladder off the collected upgrades; a file
  // with no upgrade stands on the native rung, which holds any cauldron price.
  const stateWith = (bottle: boolean, atSeller: boolean): CollectionState => ({
    world: { options: {} },
    has: () => bottle,
    count: () => 0,
    countGroup: () => 0,
    canReachRegion: (name: string) => atSeller && name === REGION_NAME.potionSeller,
  } as unknown as CollectionState);

  it('asks a potion price for the hut as well as the bottle', () => {
    const rule = ruleForPrice({ currency: 'bottle', content: CAULDRON.content });
    expect(rule(stateWith(true, true))).toBe(true);
    expect(rule(stateWith(true, false))).toBe(false);
    expect(rule(stateWith(false, true))).toBe(false);
  });

  it('asks a caught content for the bottle alone', () => {
    for (const content of ['fairy', 'bee'] as const) {
      const rule = ruleForPrice({ currency: 'bottle', content });
      expect(rule(stateWith(true, false))).toBe(true);
      expect(rule(stateWith(false, false))).toBe(false);
    }
  });

  it('names a refill price for every cauldron content, so none is gated on nothing', () => {
    for (const cauldron of POTION_CAULDRONS) expect(cauldron.price).toBeGreaterThan(0);
  });
});

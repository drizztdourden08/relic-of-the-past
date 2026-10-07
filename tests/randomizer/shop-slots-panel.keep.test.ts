/* @layer tests @kind test */
/**
 * The numbers and the titles the Shops tab shows for a scope.
 *
 * The count control used to be fed the STORED slot count, which the custom
 * mode never reads, so it sat still while the ticks moved, and its fill
 * climbed as the ceiling under it dropped. Both it and the total sentence now
 * read the opened set's own size.
 *
 * It was still drawn as a SLIDER in every mode after that, which was the same
 * lie told the other way round: in the custom mode the opened set IS the
 * ticked set, so the value equals the maximum whatever the ticks do and the
 * bar sits hard against the end while the number beside it falls. The modes
 * that do not take a count out of the ticked set now get a read-out instead,
 * and that is pinned here.
 *
 * Also pinned: what a BRAND-NEW profile's scope ticks. Every shelf slot and
 * the bomb counter start ticked; the potion seller's three cauldrons start
 * unticked, because a cauldron holding a shuffled item is opt-in.
 */
import { describe, expect, it } from 'vitest';
import { summaryOf, withSlotTicked } from '@app/ui/domains/app/compounds/ShopSlotsBlock/behavior/shop-scope-edits';
import { shopTotalTextOf } from '@app/ui/domains/app/compounds/ShopSlotsBlock/behavior/shop-total-text';
import { shopSectionsOf } from '@app/ui/domains/app/compounds/ShopSlotsBlock/behavior/shop-sections';
import { shopCountControlOf } from '@app/ui/domains/app/compounds/ShopSlotsBlock/behavior/shop-count-control';
import { VANILLA_TOTAL } from '@app/ui/domains/app/compounds/ShopSlotsBlock/ShopSlotsBlock.constants';
import { defaultShopScope } from '@shared/randomizer/ap-world/shops/shop-scope-from-values';
import { DEFAULT_OFF_SHOPS, SHOP_DEFS, STANDARD_SHOP_SLOT_COUNT } from '@shared/randomizer/ap-world/shops/shops.data';
import { SHOP_SLOT_ROWS } from '@shared/randomizer/ap-world/shops/shop-slot-options.data';
import { EMPTY_RANDOMIZER_FORM } from '@app/ui/domains/app/views/DataManager/sub-components/profile-manager/build-randomizer-config';
import { snapshotOfChoices } from '@app/hooks/randomizer/randomizer-choices';
import { normalizeRandomizerOptions } from '@shared/randomizer/options-snapshot';
import { shopScopeOfValues } from '@shared/randomizer/ap-world/shops/shop-scope-from-values';
import type { ShopScope } from '@shared/randomizer/ap-world/shops/shop-scope.type';

/** A stale stored count, which is what made the control lie in the first place. */
const STALE_COUNT = 12;

const scopeOf = (over: Partial<ShopScope>): ShopScope =>
  ({ ...defaultShopScope(), slotCount: STALE_COUNT, ...over });

describe('the count control and the total read the opened set', () => {
  it('shows the ticked count in custom mode, whatever the stored count says', () => {
    const scope = scopeOf({ mode: 'custom', depth: 2 });
    const summary = summaryOf(scope);
    expect(summary.opened).toBe(summary.ticked);
    expect(summary.opened).not.toBe(STALE_COUNT);
    expect(summary.locations).toBe(summary.opened * 2);
    expect(shopTotalTextOf(summary)).toContain(`${summary.opened} slots × 2 items`);
  });

  it('drops both the count and the total when a slot is unticked', () => {
    const before = scopeOf({ mode: 'custom' });
    const after = withSlotTicked(before, before.enabled[0], false);
    const [a, b] = [summaryOf(before), summaryOf(after)];
    expect(b.opened).toBe(a.opened - 1);
    expect(b.locations).toBe(a.locations - before.depth);
    expect(shopTotalTextOf(b)).not.toBe(shopTotalTextOf(a));
  });

  it('never lets the shown count climb as the ticked ceiling falls', () => {
    let scope = scopeOf({ mode: 'custom' });
    let previous = summaryOf(scope);
    for (const index of scope.enabled.slice(0, 4)) {
      scope = withSlotTicked(scope, index, false);
      const next = summaryOf(scope);
      expect(next.opened).toBeLessThan(previous.opened);
      expect(next.opened / next.ticked).toBeLessThanOrEqual(previous.opened / previous.ticked);
      previous = next;
    }
  });

  it('clamps the count to the ticked set in sequential mode', () => {
    const many = summaryOf(scopeOf({ mode: 'sequential' }));
    expect(many.counts).toBe(true);
    expect(many.opened).toBe(STALE_COUNT);

    const few = scopeOf({ mode: 'sequential', enabled: [0, 1, 2] });
    expect(summaryOf(few).opened).toBe(3);
    expect(summaryOf(few).ticked).toBe(3);
  });

  it('says nothing is shuffled on vanilla', () => {
    const summary = summaryOf(scopeOf({ mode: 'vanilla' }));
    expect(summary.opened).toBe(0);
    expect(summary.active).toBe(false);
    expect(shopTotalTextOf(summary)).toBe(VANILLA_TOTAL);
  });
});

describe('the cards are split by world and named for their section', () => {
  it('files every shop under exactly one heading', () => {
    const sections = shopSectionsOf(scopeOf({ mode: 'custom' }));
    expect(sections.map((section) => section.title)).toEqual(['Light World', 'Dark World']);
    expect(sections.flatMap((section) => section.cards).length).toBe(SHOP_DEFS.length);
  });

  it('drops the world words but keeps what tells two shops apart', () => {
    const named = shopSectionsOf(scopeOf({ mode: 'custom' }))
      .flatMap((section) => section.cards.map((card) => `${section.world}:${card.name}`));
    expect(named).toContain('light:Cave Shop (Lake Hylia)');
    expect(named).toContain('dark:Cave Shop (Death Mountain)');
    expect(named).toContain('light:Death Mountain Shop');
    expect(named).toContain('dark:Lumberjack Shop');
    expect(named).toContain('dark:Lake Hylia Shop');
    expect(named.some((name) => name.includes('World'))).toBe(false);
  });

  it('gives the one shop whose bare name is taken a title of its own', () => {
    const named = shopSectionsOf(scopeOf({ mode: 'custom' }))
      .flatMap((section) => section.cards.map((card) => `${section.world}:${card.name}`));
    expect(named).toContain("light:Potion Seller's Hut");
    expect(named).toContain('dark:Potion Shop');
    expect(new Set(named).size).toBe(named.length);
  });
});

describe('the count is drawn as whatever it honestly is', () => {
  /** What the slider's own fill formula would report for a control, 0..1. */
  const fillOf = (value: number, max: number): number => value / max;

  it('reads out instead of sliding in the modes the ticks alone decide', () => {
    for (const mode of ['custom', 'vanilla'] as const) {
      const control = shopCountControlOf(summaryOf(scopeOf({ mode })));
      expect(control.kind, mode).toBe('readout');
    }
  });

  it('keeps the slider where the count is a choice inside the ticked ceiling', () => {
    const summary = summaryOf(scopeOf({ mode: 'sequential' }));
    const control = shopCountControlOf(summary);
    expect(control.kind).toBe('slider');
    if (control.kind !== 'slider') return;
    expect(control.value).toBe(summary.opened);
    expect(control.max).toBe(summary.ticked);
    // The whole point of keeping it: the fill is short of the end.
    expect(fillOf(control.value, control.max)).toBeLessThan(1);
  });

  it('never leaves a full bar standing while the number under it falls', () => {
    let scope = scopeOf({ mode: 'custom' });
    for (const index of scope.enabled.slice(0, 4)) {
      scope = withSlotTicked(scope, index, false);
      const control = shopCountControlOf(summaryOf(scope));
      // A read-out has no fill to be wrong; a slider here would report 1.
      expect(control.kind).toBe('readout');
      if (control.kind !== 'readout') return;
      expect(control.value).toContain(String(summaryOf(scope).opened));
    }
  });
});

describe('a brand-new profile starts on the shipped ticks', () => {
  const hutSlots = SHOP_SLOT_ROWS
    .filter((row) => DEFAULT_OFF_SHOPS.includes(row.shop.name))
    .map((row) => row.canonicalIndex);

  it('ticks every shelf and bomb slot and leaves the hut alone', () => {
    const ticked = new Set(EMPTY_RANDOMIZER_FORM.shops.enabled);
    expect(hutSlots).toHaveLength(3);
    for (const index of hutSlots) expect(ticked.has(index), `slot ${index}`).toBe(false);
    expect(ticked.size).toBe(STANDARD_SHOP_SLOT_COUNT - hutSlots.length);
    for (const row of SHOP_SLOT_ROWS) {
      if (hutSlots.includes(row.canonicalIndex)) continue;
      expect(ticked.has(row.canonicalIndex), row.key).toBe(true);
    }
  });

  it('carries those ticks through the frozen snapshot and back', () => {
    const values = normalizeRandomizerOptions(snapshotOfChoices(EMPTY_RANDOMIZER_FORM)).values;
    for (const index of hutSlots) {
      const row = SHOP_SLOT_ROWS.find((candidate) => candidate.canonicalIndex === index);
      expect(values[row!.key], row!.key).toBe(false);
    }
    expect(shopScopeOfValues(values).enabled).toEqual(EMPTY_RANDOMIZER_FORM.shops.enabled);
  });

  it('draws that card unticked, badged, and reading as nothing-in-play', () => {
    const hut = shopSectionsOf(EMPTY_RANDOMIZER_FORM.shops)
      .flatMap((section) => section.cards)
      .find((card) => DEFAULT_OFF_SHOPS.includes(card.id));
    expect(hut).toBeDefined();
    expect(hut!.offByDefault).toBe(true);
    expect(hut!.noneOn).toBe(true);
    expect(hut!.slots.every((slot) => !slot.checked)).toBe(true);
  });
});

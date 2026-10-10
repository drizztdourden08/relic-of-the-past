/* @layer tests @kind test */
import { describe, expect, it } from 'vitest';
import { POTION_CAULDRONS, ruleForPrice } from '@rotp/randomizer';
import { CAULDRON } from './potion-price-rule.constants';
import { stateWith } from './state-with';

describe('paying a bottle price needs a source to buy the content back from', () => {

  it('asks a potion price for the hut and the bottle', () => {
    const rule = ruleForPrice({ currency: 'bottle', content: CAULDRON.content });
    expect(rule(stateWith(1, true))).toBe(true);
    expect(rule(stateWith(1, false))).toBe(false);
    expect(rule(stateWith(0, true))).toBe(false);
  });

  it('asks a caught content for the bottle alone', () => {
    for (const content of ['fairy', 'bee'] as const) {
      const rule = ruleForPrice({ currency: 'bottle', content });
      expect(rule(stateWith(1, false))).toBe(true);
      expect(rule(stateWith(0, false))).toBe(false);
    }
  });

  it('asks a counted demand for that many bottles, and an uncounted one for a single bottle', () => {
    for (const count of [1, 2, 3, 4]) {
      const rule = ruleForPrice({ currency: 'bottle', content: 'fairy', amount: count });
      for (let held = 0; held <= 4; held += 1) {
        expect(rule(stateWith(held, false)), `${count} asked, ${held} held`).toBe(held >= count);
      }
    }
    const bare = ruleForPrice({ currency: 'bottle', content: 'fairy' });
    const one = ruleForPrice({ currency: 'bottle', content: 'fairy', amount: 1 });
    for (let held = 0; held <= 4; held += 1) {
      expect(bare(stateWith(held, false)), `${held} held`).toBe(one(stateWith(held, false)));
      expect(bare(stateWith(held, false)), `${held} held`).toBe(held >= 1);
    }
  });

  it('names a refill price for every cauldron content, so none is gated on nothing', () => {
    for (const cauldron of POTION_CAULDRONS) expect(cauldron.price).toBeGreaterThan(0);
  });
});

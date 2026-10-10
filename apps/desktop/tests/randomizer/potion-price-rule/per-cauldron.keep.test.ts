/* @layer tests @kind test */
import { describe, expect, it } from 'vitest';
import { POTION_CAULDRONS, potionPriceStateOfValues, bottleContentKeyOf } from '@rotp/randomizer';
import { bottleContentRowsOf } from '@app/compounds/ShopPricesBlock/behavior/bottle-content-rows';
import { required } from '../../required';
import { ALL_PRICES } from './potion-price-rule.constants';
import { scopeWith } from './scope-with';
import { valuesOf } from './values-of';

describe('each cauldron answers for its own content alone', () => {
  const contentOf = (canonicalIndex: number) =>
    required(POTION_CAULDRONS.find((row) => row.canonicalIndex === canonicalIndex), `cauldron ${canonicalIndex}`).content;

  it('blocks exactly the one content whose cauldron is ticked', () => {
    for (const cauldron of POTION_CAULDRONS) {
      const scope = scopeWith([cauldron.canonicalIndex], 'custom');
      const state = potionPriceStateOfValues(valuesOf({ scope, prices: ALL_PRICES }));
      expect([...state.blockedContents], cauldron.content).toEqual([cauldron.content]);
      expect([...state.blockedKeys]).toEqual([bottleContentKeyOf(cauldron.content)]);
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
      const first = required(blocked[0], 'blocked row');
      expect(first.note).toContain(cauldron.label);
      expect(first.checked).toBe(false);
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
      const own = required(rows.find((row) => row.content === cauldron.content), `${cauldron.content} row`);
      expect(own.blocked, cauldron.content).toBe(false);
      expect(own.checked).toBe(true);
      expect(new Set(rows.filter((row) => row.blocked).map((row) => row.content)))
        .toEqual(new Set(others.map(contentOf)));
    }
  });

  it('never blocks a content a bottle can be filled with by hand', () => {
    const everyCauldron = POTION_CAULDRONS.map((row) => row.canonicalIndex);
    const rows = bottleContentRowsOf(valuesOf({ scope: scopeWith(everyCauldron, 'custom'), prices: ALL_PRICES }));
    for (const content of ['fairy', 'bee'] as const) {
      expect(required(rows.find((row) => row.content === content), `${content} row`).blocked, content).toBe(false);
    }
  });
});

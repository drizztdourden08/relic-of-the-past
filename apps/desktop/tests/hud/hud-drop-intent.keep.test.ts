/* @layer tests @kind test */
import { describe, expect, it } from 'vitest';
import {
  applyDrop, outlineIntent, refusalFor, refusalText, zoneIn,
} from '@app/hud-layout-editing/drop-intent';
import { siteOf } from '@app/hud-layout-editing/node-edits';
import type { HudLayout, HudNode } from '@rotp/hud';

const leaf = (id: string, extra: Partial<HudNode> = {}): HudNode =>
  ({ id, kind: 'element', element: { type: 'spacer' }, ...extra }) as HudNode;
const row = (id: string, children: HudNode[]): HudNode =>
  ({ id, kind: 'container', direction: 'row', children });

const doc = (): HudLayout => ({
  id: 'l',
  name: 'L',
  builtIn: false,
  screen: {
    id: 'screen',
    kind: 'container',
    layout: 'grid',
    columns: ['auto', 'fill', 'auto'],
    rows: ['auto', 'fill', 'auto'],
    children: [
      row('hud', [row('hearts', [leaf('pip0'), leaf('pip1'), leaf('pip2')]), leaf('magic')]),
      leaf('wallet', { place: { column: 1, row: 3 } }),
      { id: 'rep', kind: 'element', element: { type: 'repeat', count: 8, child: row('tpl', [leaf('fill')]) } },
      {
        id: 'sw',
        kind: 'element',
        element: { type: 'switch', cases: [{ when: '1', node: leaf('full') }], otherwise: leaf('empty') },
      },
    ],
  },
});

const childIds = (d: HudLayout, id: string): string[] => {
  const node = siteOf(d, id)?.node;
  return node?.kind === 'container' ? node.children.map((c) => c.id) : [];
};

describe('the outline zones', { tags: ['critical'] }, () => {
  it('splits a container row four ways and a leaf row two', () => {
    const container = { isContainer: true, hasSiblings: true };
    expect(zoneIn(0.1, container)).toBe('before');
    expect(zoneIn(0.4, container)).toBe('inside-start');
    expect(zoneIn(0.6, container)).toBe('inside-end');
    expect(zoneIn(0.9, container)).toBe('after');
    const leafRow = { isContainer: false, hasSiblings: true };
    expect(zoneIn(0.1, leafRow)).toBe('before');
    expect([zoneIn(0.4, leafRow), zoneIn(0.6, leafRow), zoneIn(0.9, leafRow)]).toEqual(['after', 'after', 'after']);
  });

  it('gives a row with no siblings no before/after at all', () => {
    const screenRow = { isContainer: true, hasSiblings: false };
    expect(zoneIn(0.1, screenRow)).toBe('inside-start');
    expect(zoneIn(0.9, screenRow)).toBe('inside-end');
  });
});

describe('inserting at the front of a container', { tags: ['critical'] }, () => {
  it('can target either end of a container', () => {
    const d = doc();
    expect(outlineIntent(d, 'hud', 'inside-start', ['wallet'])).toEqual({ kind: 'flex', parentId: 'hud', index: 0 });
    expect(outlineIntent(d, 'hud', 'inside-end', ['wallet'])).toEqual({ kind: 'flex', parentId: 'hud', index: 2 });
  });

  it('lands the node first, and on the SCREEN that is the paint order (§42.8)', () => {
    const d = doc();
    expect(childIds(applyDrop(d, ['wallet'], outlineIntent(d, 'hud', 'inside-start', ['wallet'])), 'hud'))
      .toEqual(['wallet', 'hearts', 'magic']);
    const first = applyDrop(d, ['magic'], outlineIntent(d, 'screen', 'inside-start', ['magic']));
    expect(childIds(first, 'screen')[0]).toBe('magic');
  });

  it('still reads before/after as a position among that row\'s own siblings', () => {
    const d = doc();
    expect(outlineIntent(d, 'hearts', 'before', ['wallet'])).toEqual({ kind: 'flex', parentId: 'hud', index: 0 });
    expect(outlineIntent(d, 'hearts', 'after', ['wallet'])).toEqual({ kind: 'flex', parentId: 'hud', index: 1 });
  });
});

describe('the seven refusals, each naming both nodes', { tags: ['critical'] }, () => {
  const d = doc();
  const reasonOf = (rowId: string, zone: Parameters<typeof outlineIntent>[2], ids: string[]) => {
    const intent = outlineIntent(d, rowId, zone, ids);
    return intent.kind === 'refused' ? intent.reason : intent.kind;
  };

  it('self, descendant and not-a-container', () => {
    expect(reasonOf('hearts', 'inside-end', ['hearts'])).toBe('self');
    expect(reasonOf('pip1', 'after', ['hud'])).toBe('descendant');
    expect(reasonOf('magic', 'inside-end', ['wallet'])).toBe('not-a-container');
  });

  it('source-locked for the screen, a repeat\'s child and a switch\'s case', () => {
    expect(reasonOf('hearts', 'inside-end', ['screen'])).toBe('source-locked');
    expect(reasonOf('hearts', 'inside-end', ['tpl'])).toBe('source-locked');
    expect(reasonOf('hearts', 'inside-end', ['full'])).toBe('source-locked');
  });

  it('target-locked onto a repeat or switch element itself', () => {
    expect(refusalFor(d, ['wallet'], 'rep')?.reason).toBe('target-locked');
    expect(refusalFor(d, ['wallet'], 'sw')?.reason).toBe('target-locked');
    expect(refusalFor(d, ['wallet'], 'tpl')).toBeNull();
  });

  it('grid-column past the last DECLARED column, because rows grow and columns do not', () => {
    expect(refusalFor(d, ['wallet'], 'screen', { column: 3, row: 4 })).toBeNull();
    expect(refusalFor(d, ['wallet'], 'screen', { column: 4, row: 1 })?.reason).toBe('grid-column');
  });

  it('budget, measured on the document the drop WOULD produce', () => {
    const big = row('big', Array.from({ length: 30 }, (_, i) => leaf(`b${i}`)));
    const d2 = doc();
    const rep = d2.screen.children.find((c) => c.id === 'rep') as { element: Record<string, unknown> };
    rep.element = { ...rep.element, count: { from: 'data', expr: 'life_max' } };
    (d2.screen.children).push(big);
    expect(refusalFor(d2, ['big'], 'tpl')?.reason).toBe('budget');
    expect(refusalFor(d2, ['big'], 'hearts')).toBeNull();
  });

  it('says it as a sentence, and refuses to write anything', () => {
    const intent = outlineIntent(d, 'pip1', 'after', ['hud']);
    expect(refusalText(d, ['hud'], intent)).toBe('hearts is already inside hud');
    expect(applyDrop(d, ['hud'], intent)).toBe(d);
  });
});

describe('the one write', { tags: ['critical'] }, () => {
  it('drops a `place` that has stopped meaning anything, and keeps one that has not', () => {
    const d = doc();
    const moved = applyDrop(d, ['wallet'], outlineIntent(d, 'hearts', 'inside-end', ['wallet']));
    expect(siteOf(moved, 'wallet')?.node.place).toBeUndefined();
    const same = applyDrop(d, ['wallet'], { kind: 'flex', parentId: 'screen', index: 0 });
    expect(siteOf(same, 'wallet')?.node.place).toEqual({ column: 1, row: 3 });
  });

  it('makes a grid drop one edit that carries the move and the cell together', { tags: ['critical'] }, () => {
    const d = doc();
    const next = applyDrop(d, ['magic'], { kind: 'grid', parentId: 'screen', place: { column: 3, row: 1 }, onto: null });
    expect(siteOf(next, 'magic')?.parent?.id).toBe('screen');
    expect(siteOf(next, 'magic')?.node.place).toEqual({ column: 3, row: 1 });
    expect(childIds(next, 'hud')).toEqual(['hearts']);
  });
});

/* @layer test @kind test */
import { describe, expect, it } from 'vitest';
import { placedById } from '@shared/hud/engine';
import type { HudNode } from '@shared/types/hud';
import { leaf } from './leaf';
import { placedOf } from './placed-of';

describe('worked example 2 - the hearts (repeat over containers, switch per heart)', () => {
  const hearts = (): HudNode => ({
    kind: 'element',
    id: 'hearts',
    element: {
      type: 'repeat',
      count: { from: 'data', expr: 'ceil(life_max / 8)' },
      item: 'min(max(life_current - index * 8, 0), 8)',
      child: {
        kind: 'element',
        id: 'heart',
        element: {
          type: 'switch',
          cases: [
            { when: 'item >= 8', node: leaf('h-full', { element: { type: 'sprite', file: 'heart-full' } }) },
            { when: 'item >= 4', node: leaf('h-half', { element: { type: 'sprite', file: 'heart-half' } }) },
            { when: 'item > 0', node: leaf('h-qtr', { element: { type: 'sprite', file: 'heart-quarter' } }) },
          ],
          otherwise: leaf('h-empty', { element: { type: 'sprite', file: 'heart-empty' } }),
        },
      },
    },
  } as HudNode);

  it('life_current=100, life_max=160: 12 full, 1 half, 7 empty - 20 hearts total', () => {
    const placed = placedOf(hearts(), { life_current: 100, life_max: 160 });
    const spriteFiles = placed
      .filter((p) => p.node.kind === 'element' && p.node.element.type === 'sprite')
      .map((p) => (p.node.kind === 'element' && p.node.element.type === 'sprite' ? p.node.element.file : ''));
    expect(spriteFiles.filter((f) => f === 'heart-full')).toHaveLength(12);
    expect(spriteFiles.filter((f) => f === 'heart-half')).toHaveLength(1);
    expect(spriteFiles.filter((f) => f === 'heart-empty')).toHaveLength(7);
    expect(spriteFiles).toHaveLength(20);
  });

  it('every unrolled heart keeps a unique id, suffixed by its repeat index', () => {
    const placed = placedOf(hearts(), { life_current: 100, life_max: 160 });
    const ids = placed.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(placedById(placed, 'h-full#0')).toBeDefined();
    expect(placedById(placed, 'h-half#12')).toBeDefined();
    expect(placedById(placed, 'h-empty#19')).toBeDefined();
  });

  it('zero capacity draws zero hearts - ceil(0/8) is 0, not a crash', () => {
    const placed = placedOf(hearts(), { life_current: 0, life_max: 0 });
    expect(placed.filter((p) => p.node.kind === 'element' && p.node.element.type === 'sprite')).toHaveLength(0);
  });
});

describe('repeat - index, count and item reach the child', () => {
  it('index and the repeat\'s own resolved count are both in scope', () => {
    const rep: HudNode = {
      kind: 'element',
      id: 'rep',
      element: {
        type: 'repeat',
        count: 4,
        child: leaf('cell', { size: { w: { from: 'data', expr: 'count * 2 + index' } } }),
      },
    } as HudNode;
    const placed = placedOf(rep, {});
    expect(placedById(placed, 'cell#0')?.rect.w).toBe(8);
    expect(placedById(placed, 'cell#3')?.rect.w).toBe(11);
  });

  it('item defaults to index when the repeat gives none of its own', () => {
    const rep: HudNode = {
      kind: 'element',
      id: 'rep',
      element: { type: 'repeat', count: 3, child: leaf('cell', { size: { w: { from: 'data', expr: 'item + 5' } } }) },
    } as HudNode;
    const placed = placedOf(rep, {});
    expect(placedById(placed, 'cell#0')?.rect.w).toBe(5);
    expect(placedById(placed, 'cell#2')?.rect.w).toBe(7);
  });
});

describe('switch - first match wins, order is the logic', () => {
  const pick = (): HudNode => ({
    kind: 'element',
    id: 'sw',
    element: {
      type: 'switch',
      cases: [
        { when: 'x >= 0', node: leaf('first') },
        { when: 'x >= 0', node: leaf('second') },
      ],
      otherwise: leaf('none'),
    },
  } as HudNode);

  it('the FIRST matching case wins even when a later one would also match', () => {
    const placed = placedOf(pick(), { x: 1 });
    expect(placedById(placed, 'first')).toBeDefined();
    expect(placedById(placed, 'second')).toBeUndefined();
  });

  it('otherwise draws when no case matches', () => {
    const placed = placedOf(pick(), { x: -1 });
    expect(placedById(placed, 'none')).toBeDefined();
    expect(placedById(placed, 'first')).toBeUndefined();
  });

  it('a switch with no matching case and no otherwise draws nothing at all', () => {
    const bare: HudNode = { kind: 'element', id: 'sw', element: { type: 'switch', cases: [{ when: 'x >= 0', node: leaf('a') }] } } as HudNode;
    const wrappingRowOnly = 1;
    expect(placedOf(bare, { x: -1 })).toHaveLength(wrappingRowOnly);
  });
});

describe('expand.ts guards a runaway expression', () => {
  it('ceil(1 / 0) does not become a repeat of a million - it clamps to MAX_REPEAT_COUNT (200)', () => {
    const rep: HudNode = {
      kind: 'element', id: 'rep', element: { type: 'repeat', count: { from: 'data', expr: 'ceil(1 / 0)' }, child: leaf('cell') },
    } as HudNode;
    const placed = placedOf(rep, {});
    const cells = placed.filter((p) => p.id.startsWith('cell#'));
    expect(cells).toHaveLength(200);
  });

  it('a negative or NaN count resolves to zero instances, not a crash', () => {
    const rep: HudNode = {
      kind: 'element', id: 'rep', element: { type: 'repeat', count: { from: 'data', expr: '0 / 0' }, child: leaf('cell') },
    } as HudNode;
    expect(placedOf(rep, {}).filter((p) => p.id.startsWith('cell#'))).toHaveLength(0);
  });
});

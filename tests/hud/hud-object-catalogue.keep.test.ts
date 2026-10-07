/* @layer test @kind test */
/**
 * Phase 3 of `plans/hud-data-binding.html`: the four objects - `text`,
 * `repeat`, `switch`, `button` - and `expand.ts`, the pass that turns a
 * dynamic tree into a static one before anything is measured.
 *
 * THE WORKED EXAMPLE IS THE HEARTS. It is the plan's own proof that the model
 * is enough: a `repeat` over containers, and a per-heart `switch` choosing the
 * sprite - two levels of dynamic behaviour, composed from nothing but the two
 * new kinds. `and`/`or`/`not` are used throughout, never `&&`/`||`
 * (`&& is not expr-eval's real grammar`, contract §22.6).
 */
import { describe, expect, it } from 'vitest';
import { faceFor, stateFor } from '@app/ui/domains/hud/compounds/HudButton/behavior/hud-button-state';
import {
  layoutHud, placedById, resolveTextContent, snapGameFontSize, textIntrinsicSize,
} from '@shared/hud/engine';
import { tryLoadLayout } from '@shared/hud/layouts';
import type { HudContainer, HudLayout, HudNode } from '@shared/types/hud';

const VIEW = { w: 400, h: 200 };

const leaf = (id: string, extra: Partial<HudNode> = {}): HudNode => ({
  kind: 'element', id, element: { type: 'slot', index: 1 }, ...extra,
} as HudNode);

/** The screen the nine anchors became (§42): three bands each way, with this
 *  root in the top-left cell - exactly what `anchor: 'top-left'` used to say. */
const docOf = (root: HudContainer): HudLayout => ({
  id: 'test',
  name: 'Test',
  builtIn: false,
  screen: {
    kind: 'container',
    id: 'screen',
    layout: 'grid',
    columns: ['auto', 'fill', 'auto'],
    rows: ['auto', 'fill', 'auto'],
    justifyItems: 'start',
    alignItems: 'start',
    children: [{ ...root, place: { column: 1, row: 1 } }],
  },
});

const row = (children: HudNode[], extra: Partial<HudContainer> = {}): HudContainer => ({
  kind: 'container', id: 'root', direction: 'row', children, ...extra,
} as HudContainer);

const placedOf = (root: HudContainer, scope: Record<string, number>) =>
  layoutHud(docOf(row([root])), VIEW, { scope });

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
    // Widths stay <= 16 (the leaf's own natural size) so the box's WIDTH is
    // always the constraining dimension of "contain, centred" - see
    // `hud-layout-engine.keep.test.ts`'s own note on why an element's placed
    // rect is never just its box.
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
    expect(placedOf(bare, { x: -1 })).toHaveLength(1); // the wrapping row only
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

describe('validate-expand-budget - the validator refuses a document that could expand too far', () => {
  const deepRepeat = (count: number): HudNode => ({
    kind: 'element',
    id: 'outer',
    element: {
      type: 'repeat',
      count,
      child: {
        kind: 'element', id: 'inner', element: { type: 'repeat', count, child: leaf('leaf') },
      },
    },
  } as HudNode);

  it('a plausible single repeat (well under budget) loads fine', () => {
    const doc = { id: 'ok', name: 'OK', builtIn: false, regions: [{ anchor: 'top-left', root: row([deepRepeat(1)]) }] };
    const result = tryLoadLayout(doc);
    expect(result.ok).toBe(true);
  });

  it('two nested repeats at 200 each (40,000 worst-case nodes) are refused, loudly, naming the budget', () => {
    const doc = { id: 'bad', name: 'Bad', builtIn: false, regions: [{ anchor: 'top-left', root: row([deepRepeat(200)]) }] };
    const result = tryLoadLayout(doc);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.some((e) => e.includes('worst-case expansion'))).toBe(true);
  });
});

describe('text - content resolution and the pixel-face size snap', () => {
  it('a literal string value draws exactly as given, ignoring format', () => {
    expect(resolveTextContent(
      { type: 'text', value: 'HELLO', face: { from: 'font', family: 'sans', size: 16 } },
      {},
    )).toBe('HELLO');
  });

  it('a bound numeric value is formatted: zero-padded, space-padded, or not at all', () => {
    const base = { type: 'text' as const, value: { from: 'data' as const, expr: 'arrow_current' }, face: { from: 'sprite' as const, set: 'hud-digits' as const } };
    expect(resolveTextContent({ ...base, format: { digits: 2, pad: 'zero' } }, { arrow_current: 5 })).toBe('05');
    expect(resolveTextContent({ ...base, format: { digits: 3, pad: 'space' } }, { arrow_current: 7 })).toBe('  7');
    expect(resolveTextContent({ ...base, format: { digits: 3, pad: 'none' } }, { arrow_current: 7 })).toBe('7');
  });

  it('ALttP Dialogue snaps to a whole multiple of its 16px design size', () => {
    expect(snapGameFontSize(20)).toBe(16);
    expect(snapGameFontSize(24)).toBe(32);
    expect(snapGameFontSize(8)).toBe(16);
    expect(snapGameFontSize(32)).toBe(32);
  });

  it('a sprite face measures a fixed 8px-tall row, a font face scales with its (snapped) size', () => {
    expect(textIntrinsicSize('05', { from: 'sprite', set: 'hud-digits' }).h).toBe(8);
    expect(textIntrinsicSize('X', { from: 'font', family: 'game', size: 20 }).h).toBeGreaterThan(
      textIntrinsicSize('X', { from: 'font', family: 'sans', size: 8 }).h,
    );
  });
});

describe('button - bind validation, derived unassigned flag, and the states fallback', () => {
  const buttonDoc = (bind: unknown) => ({
    id: 'btn', name: 'Btn', builtIn: false,
    regions: [{
      anchor: 'top-left',
      root: {
        kind: 'container', id: 'root', direction: 'row',
        children: [{
          kind: 'element', id: 'b', element: { type: 'button', bind, states: { idle: { from: 'image', file: 'a.png' } } },
        }],
      },
    }],
  });

  it('a verb bind is accepted', () => {
    expect(tryLoadLayout(buttonDoc({ kind: 'verb', verb: 'pause' })).ok).toBe(true);
  });

  it('a slot bind derives dimWhenEmpty from its own index - no separate flag to author', () => {
    const result = tryLoadLayout(buttonDoc({ kind: 'slot', index: 5 }));
    expect(result.ok).toBe(true);
    if (result.ok) {
      const root = result.doc.screen.children[0] as { children: { dimWhenEmpty?: number[] }[] };
      const button = root.children[0];
      expect(button.dimWhenEmpty).toEqual([5]);
    }
  });

  it('a slot index under 1 is refused', () => {
    expect(tryLoadLayout(buttonDoc({ kind: 'slot', index: 0 })).ok).toBe(false);
  });

  it('faceFor falls back to idle when a state has no face of its own', () => {
    const spec = { type: 'button' as const, bind: { kind: 'verb' as const, verb: 'pause' as const }, states: { idle: { from: 'image' as const, file: 'idle.png' } } };
    expect(faceFor(spec, 'pressed')).toEqual({ from: 'image', file: 'idle.png' });
  });

  it('stateFor prioritises pressed, then held, then unassigned, then idle', () => {
    expect(stateFor({ pressed: true, held: true, unassigned: true })).toBe('pressed');
    expect(stateFor({ held: true, unassigned: true })).toBe('held');
    expect(stateFor({ unassigned: true })).toBe('unassigned');
    expect(stateFor({})).toBe('idle');
  });
});

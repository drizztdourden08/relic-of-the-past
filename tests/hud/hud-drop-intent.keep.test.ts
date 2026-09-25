/* @layer tests @kind test */
/**
 * Phase 1 of `plans/hud-drag-and-drop.html` tests THE RESOLVER, HEADLESS.
 *
 * Every refusal reason and the whole outline vocabulary is exercised here
 * before a pointer event exists, which is the point of the phase: the resolver
 * is the half that is cheap to get wrong and expensive to debug through a
 * gesture.
 *
 * THREE CLAIMS THAT WERE DECISIONS, NOT DETAILS:
 *
 *  1. INSERTING AT THE FRONT OF A CONTAINER IS NEWLY POSSIBLE. `resolveDrop`,
 *     which this replaces, answered `{ parentId, at: children.length }` for
 *     EVERY `inside`, so the outline could only ever append, and the front of
 *     a collapsed container, or of the screen itself, was unreachable by any
 *     gesture at all. The old function is reproduced verbatim below so the
 *     defect is pinned instead of described.
 *  2. VALIDITY NEVER RETARGETS. A refusal names both nodes and stops; it does
 *     not silently walk outward to the nearest legal ancestor.
 *  3. `moveNode` HAS EXACTLY ONE CALLER. The same structural test §37.1 used
 *     for `margin.left`, one level up.
 */
import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'fs';
import { join, resolve } from 'path';
import { pushDismissable, topDismissLevel } from '../../apps/web/src/ui/design-system/primitives/Portal/behavior/dismiss-stack';
import {
  applyDrop, outlineIntent, refusalFor, refusalText, zoneIn,
} from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/behavior/drop-intent';
import { siteOf } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/behavior/node-edits';
import type { HudLayout, HudNode } from '../../shared/types/hud';

const EDITOR = resolve(__dirname, '../../apps/web/src/ui/domains/app/views/HudLayoutEditor');
const tsIn = (dir: string): string[] => readdirSync(dir, { withFileTypes: true })
  .flatMap((e) => (e.isDirectory() ? tsIn(join(dir, e.name)) : (/\.tsx?$/.test(e.name) ? [join(dir, e.name)] : [])));

const leaf = (id: string, extra: Partial<HudNode> = {}): HudNode =>
  ({ id, kind: 'element', element: { type: 'spacer' }, ...extra }) as HudNode;
const row = (id: string, children: HudNode[]): HudNode =>
  ({ id, kind: 'container', direction: 'row', children }) as HudNode;

/**
 * screen (grid, 3 columns)
 *  ├ hud (row) ─ hearts (row) ─ pip0..pip2 ┆ magic
 *  ├ wallet (leaf, cell 1,3)
 *  ├ rep (repeat ×8) ─ tpl (row) ─ fill
 *  └ sw (switch) ─ full / empty
 */
const doc = (): HudLayout => ({
  id: 'l',
  name: 'L',
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
}) as unknown as HudLayout;

const childIds = (d: HudLayout, id: string): string[] => {
  const node = siteOf(d, id)?.node;
  return node?.kind === 'container' ? node.children.map((c) => c.id) : [];
};

/** `OutlinePanel.resolveDrop`, exactly as it shipped. It is reproduced so the
 *  defect below is a fact about the old code instead of a claim about it. */
const legacyResolveDrop = (d: HudLayout, target: { id: string; where: 'before' | 'inside' | 'after' }) => {
  const site = siteOf(d, target.id);
  if (!site) return null;
  if (target.where === 'inside') {
    return site.node.kind === 'container' ? { parentId: site.node.id, at: site.node.children.length } : null;
  }
  if (!site.parent) return null;
  return { parentId: site.parent.id, at: site.index + (target.where === 'after' ? 1 : 0) };
};

describe('the outline zones', () => {
  it('splits a container row four ways and a leaf row two', () => {
    const container = { isContainer: true, hasSiblings: true };
    expect(zoneIn(0.1, container)).toBe('before');
    expect(zoneIn(0.4, container)).toBe('inside-start');
    expect(zoneIn(0.6, container)).toBe('inside-end');
    expect(zoneIn(0.9, container)).toBe('after');
    // A leaf has no `inside` to lose the middle to, which is unchanged from `whereIn`.
    const leafRow = { isContainer: false, hasSiblings: true };
    expect(zoneIn(0.1, leafRow)).toBe('before');
    expect([zoneIn(0.4, leafRow), zoneIn(0.6, leafRow), zoneIn(0.9, leafRow)]).toEqual(['after', 'after', 'after']);
  });

  it('gives a row with no siblings no before/after at all', () => {
    // The screen. `resolveDrop` answered `null` for both, leaving a dead zone a
    // quarter of the row tall, where a release did nothing and said nothing.
    const screenRow = { isContainer: true, hasSiblings: false };
    expect(zoneIn(0.1, screenRow)).toBe('inside-start');
    expect(zoneIn(0.9, screenRow)).toBe('inside-end');
    expect(legacyResolveDrop(doc(), { id: 'screen', where: 'before' })).toBeNull();
  });
});

describe('inserting at the front of a container', () => {
  it('is what the old resolver could not express', () => {
    const d = doc();
    expect(outlineIntent(d, 'hud', 'inside-start', ['wallet'])).toEqual({ kind: 'flex', parentId: 'hud', index: 0 });
    expect(outlineIntent(d, 'hud', 'inside-end', ['wallet'])).toEqual({ kind: 'flex', parentId: 'hud', index: 2 });
    // The old function had ONE answer for the whole middle band, and it was
    // the back of the list. This is the assertion that fails against it.
    expect(legacyResolveDrop(d, { id: 'hud', where: 'inside' })).toEqual({ parentId: 'hud', at: 2 });
  });

  it('lands the node first, and on the SCREEN that is the paint order (§42.8)', () => {
    const d = doc();
    expect(childIds(applyDrop(d, ['wallet'], outlineIntent(d, 'hud', 'inside-start', ['wallet'])), 'hud'))
      .toEqual(['wallet', 'hearts', 'magic']);
    // "Put this backdrop behind everything" had no control at all before: the
    // screen's own children order IS the whole paint order now.
    const first = applyDrop(d, ['magic'], outlineIntent(d, 'screen', 'inside-start', ['magic']));
    expect(childIds(first, 'screen')[0]).toBe('magic');
  });

  it('still reads before/after as a position among that row\'s own siblings', () => {
    const d = doc();
    expect(outlineIntent(d, 'hearts', 'before', ['wallet'])).toEqual({ kind: 'flex', parentId: 'hud', index: 0 });
    expect(outlineIntent(d, 'hearts', 'after', ['wallet'])).toEqual({ kind: 'flex', parentId: 'hud', index: 1 });
  });
});

describe('the seven refusals, each naming both nodes', () => {
  const d = doc();
  const reasonOf = (rowId: string, zone: Parameters<typeof outlineIntent>[2], ids: string[]) => {
    const intent = outlineIntent(d, rowId, zone, ids);
    return intent.kind === 'refused' ? intent.reason : intent.kind;
  };

  it('self, descendant and not-a-container', () => {
    expect(reasonOf('hearts', 'inside-end', ['hearts'])).toBe('self');
    // Dragging `hud` onto a pip inside it: the pip is a leaf, so the zone
    // resolves to its parent `hearts`, which is still inside the subtree.
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
    // But its container DESCENDANTS are ordinary targets. That is how a
    // heart's inner arrangement is authored.
    expect(refusalFor(d, ['wallet'], 'tpl')).toBeNull();
  });

  it('grid-column past the last DECLARED column, because rows grow and columns do not', () => {
    expect(refusalFor(d, ['wallet'], 'screen', { column: 3, row: 4 })).toBeNull();
    expect(refusalFor(d, ['wallet'], 'screen', { column: 4, row: 1 })?.reason).toBe('grid-column');
  });

  it('budget, measured on the document the drop WOULD produce', () => {
    const big = row('big', Array.from({ length: 30 }, (_, i) => leaf(`b${i}`)));
    const d2 = doc();
    // A BOUND count has no literal to floor, so the worst case is
    // MAX_REPEAT_COUNT, which is the case the cap exists for.
    const rep = d2.screen.children.find((c) => c.id === 'rep') as { element: Record<string, unknown> };
    rep.element = { ...rep.element, count: { from: 'data', expr: 'life_max' } };
    (d2.screen.children as HudNode[]).push(big);
    // 200 passes x 33 nodes = 6,600, over the 5,000 cap. A refusal found on
    // release would be a refusal the ghost lied about, so it is found here.
    expect(refusalFor(d2, ['big'], 'tpl')?.reason).toBe('budget');
    expect(refusalFor(d2, ['big'], 'hearts')).toBeNull();
  });

  it('says it as a sentence, and refuses to write anything', () => {
    const intent = outlineIntent(d, 'pip1', 'after', ['hud']);
    expect(refusalText(d, ['hud'], intent)).toBe('hearts is already inside hud');
    expect(applyDrop(d, ['hud'], intent)).toBe(d);
  });
});

describe('the one write', () => {
  it('drops a `place` that has stopped meaning anything, and keeps one that has not', () => {
    const d = doc();
    // Leaving the screen's grid for a flex parent: the cell is meaningless
    // where the node now lives, so it goes, per `offset.ts`'s "zero is absent".
    const moved = applyDrop(d, ['wallet'], outlineIntent(d, 'hearts', 'inside-end', ['wallet']));
    expect(siteOf(moved, 'wallet')?.node.place).toBeUndefined();
    // Reordered inside its OWN parent, the key still says what it said.
    const same = applyDrop(d, ['wallet'], { kind: 'flex', parentId: 'screen', index: 0 });
    expect(siteOf(same, 'wallet')?.node.place).toEqual({ column: 1, row: 3 });
  });

  it('makes a grid drop one edit that carries the move and the cell together', () => {
    const d = doc();
    const next = applyDrop(d, ['magic'], { kind: 'grid', parentId: 'screen', place: { column: 3, row: 1 }, onto: null });
    expect(siteOf(next, 'magic')?.parent?.id).toBe('screen');
    expect(siteOf(next, 'magic')?.node.place).toEqual({ column: 3, row: 1 });
    expect(childIds(next, 'hud')).toEqual(['hearts']);
  });
});

describe('single ownership, and the new dismiss level', () => {
  it('leaves `moveNode` exactly one caller in the whole editor', () => {
    // §37.1's test shape, one level up: a second writer is drift, and this is
    // the check that one cannot appear unnoticed.
    const callers = tsIn(EDITOR)
      .filter((f) => !/behavior[\\/](drop-intent|node-edits)\.ts$/.test(f))
      .filter((f) => /\bmoveNode\s*\(/.test(readFileSync(f, 'utf8')));
    expect(callers).toEqual([]);
  });

  it('routes the outline through `applyDrop`, not through the tree', () => {
    const reads = (f: string): string => readFileSync(join(EDITOR, f), 'utf8');
    expect(reads('behavior/useNodeEdits.ts')).toContain("from './drop-intent'");
    expect(reads('sub-components/OutlinePanel.tsx')).toContain("from '../behavior/drop-intent'");
  });

  it('puts `drag` above `popover`, so Escape mid-drag cancels the drag', () => {
    const closePopover = pushDismissable('popover', () => {});
    expect(topDismissLevel()).toBe('popover');
    const cancelDrag = pushDismissable('drag', () => {});
    expect(topDismissLevel()).toBe('drag');
    cancelDrag();
    expect(topDismissLevel()).toBe('popover');
    closePopover();
  });
});

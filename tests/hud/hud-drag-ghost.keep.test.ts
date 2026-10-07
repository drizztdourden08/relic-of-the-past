// @vitest-environment jsdom
/* @layer tests @kind test */
/**
 * THE GHOST, and the four states it has to be able to say.
 *
 * §44 shipped it with five, the fifth being the stage's margin nudge. §46
 * removed the stage's drop surface and the card that went with it, so the nudge
 * has no ghost to be a state of; what is left is the outline's card, which is
 * where every state below is reached from.
 *
 * WHY THE WORDS ARE TESTED AND NOT THE PIXELS. The plan's own check on the
 * design is that the card's content makes a sentence: "if the ghost's content
 * does not make a sentence, the ghost is decorative", and phase 6's `aria-live`
 * announcement is these same lines flattened. So the assertions here are
 * strings, deliberately, and the geometry is measured in headless Chromium
 * instead (`hud-drag-indicators.keep.test.ts`).
 *
 * THE ONE THIS EXISTS FOR IS `refused`. §43 recorded that a refused drop
 * currently gives NO feedback at all. The outline's row highlight was removed
 * on the understanding that the ghost would be the full answer, so the test
 * that closes that loop is the one that checks a refusal NAMES BOTH NODES and
 * turns the whole card instead of one word of it.
 *
 * AND THE VOCABULARY IS §42's. `row`, `column`, `grid 3×2`, `overlap`, `screen`.
 * There is no `stack`; `overlap` is a UI word for a grid whose children share a
 * cell, recognised by shape, not by a keyword, and the document still
 * says `grid`.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, createElement as h, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import {
  containerKind, ghostFor, ghostPosition,
} from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/behavior/drop-ghost';
import { outlineIntent } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/behavior/drop-intent';
import { DragGhost } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components/DragGhost';
import { OutlinePanel } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components/OutlinePanel';
import { PlatformContext } from '../../apps/web/src/platform/PlatformProvider';
import type { Platform } from '../../shared/platform';
import type { HudLayout, HudNode } from '../../shared/types/hud';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const leaf = (id: string): HudNode => ({ id, kind: 'element', element: { type: 'spacer' } } as unknown as HudNode);

const DOC = {
  id: 'l',
  name: 'l',
  screen: {
    id: 'screen',
    kind: 'container',
    layout: 'grid',
    columns: ['auto', 'fill', 'auto'],
    rows: ['auto', 'fill', 'auto'],
    children: [
      {
        id: 'hud',
        kind: 'container',
        direction: 'column',
        children: [
          { id: 'hearts', kind: 'container', direction: 'row', children: [leaf('pip1'), leaf('pip2')] },
          leaf('magic-bar'),
        ],
      },
      {
        id: 'badge',
        kind: 'container',
        layout: 'grid',
        columns: ['auto', 'auto', 'auto'],
        rows: ['auto', 'auto'],
        children: [
          { ...leaf('life_pip'), place: { column: 1, row: 1 } },
          { ...leaf('coin'), place: { column: 2, row: 2 } },
        ],
      },
      {
        id: 'overlay',
        kind: 'container',
        layout: 'grid',
        columns: ['auto'],
        children: [
          { ...leaf('glyph'), place: { column: 1, row: 1 } },
          { ...leaf('item'), place: { column: 1, row: 1 } },
        ],
      },
      {
        id: 'rep',
        kind: 'element',
        element: {
          type: 'repeat',
          count: 8,
          child: { id: 'heart', kind: 'container', direction: 'row', children: [leaf('fill-sprite')] },
        },
      },
    ],
  },
} as unknown as HudLayout;

let mounted: { root: Root; host: HTMLElement } | null = null;

const mount = (node: ReactNode): void => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);
  act(() => { root.render(node); });
  mounted = { root, host };
};

afterEach(() => {
  if (!mounted) return;
  const { root, host } = mounted;
  act(() => root.unmount());
  host.remove();
  mounted = null;
  document.querySelector('#portal-root')?.remove();
});

describe('line 1 states the KIND, in §42\'s vocabulary and no other', () => {
  it('says row, column, grid n×m, overlap and screen but never stack', () => {
    const kind = (id: string): string => {
      const found = [DOC.screen, ...DOC.screen.children].find((n) => n.id === id);
      return containerKind(found ?? null, id === 'screen');
    };
    expect(kind('hud')).toBe('column');
    expect(kind('badge')).toBe('grid 3×2');
    // A grid whose children all name one cell is an OVERLAY. The document still
    // says `grid`; the word is the editor's.
    expect(kind('overlay')).toBe('overlap');
    expect(kind('screen')).toBe('screen');
    expect(containerKind(DOC.screen.children[0].children[0], false)).toBe('row');
    // A grid holding ONE explicitly-placed child is a grid, not an overlay.
    // `isOverlay` is trivially true of it, which is right for the reflow
    // warning it was written for and wrong as a name.
    const single = { ...DOC.screen.children[1], children: [DOC.screen.children[1].children[0]] };
    expect(containerKind(single, false)).toBe('grid 3×1');
  });
});

describe('the four states', () => {
  it('FLEX names a position among the children it would have', () => {
    const ghost = ghostFor(DOC, ['magic-bar'], { kind: 'flex', parentId: 'hud', index: 1 });
    expect(ghost).toMatchObject({ tone: 'move', chip: 'magic-bar', kind: 'into column' });
    // The count is the target's child count AFTER the removal when the node is
    // already in that parent, so "2 of 2", never "2 of 3".
    expect(ghost.position).toBe('position 2 of 2');
    expect(ghost.path).toBe('screen › hud');
  });

  it('an empty GRID cell names the cell and the word `empty`', () => {
    const ghost = ghostFor(DOC, ['hearts'], {
      kind: 'grid', parentId: 'screen', place: { column: 3, row: 1 }, onto: null,
    });
    expect(ghost.kind).toBe('into screen');
    expect(ghost.position).toBe('cell 3,1 · empty');
    // On the screen root this drop IS the old anchor picker: cell 3,1 is
    // `top-right`. One crumb, because there is no path above it.
    expect(ghost.path).toBe('screen');
  });

  it('a co-placed GRID cell says `with`, which is the whole difference', () => {
    const ghost = ghostFor(DOC, ['glyph'], {
      kind: 'grid', parentId: 'badge', place: { column: 1, row: 1 }, onto: 'life_pip',
    });
    expect(ghost.position).toBe('cell 1,1 · with life_pip');
    expect(ghost.tone).toBe('move');
  });

  it('REFUSED turns the whole card, and line 2 names BOTH nodes', () => {
    // Dropping `hearts` onto its own child. "invalid target" is not a sentence
    // anyone can act on; this is.
    const intent = outlineIntent(DOC, 'pip1', 'inside-start', ['hearts']);
    const ghost = ghostFor(DOC, ['hearts'], intent);
    expect(ghost.tone).toBe('refused');
    expect(ghost.kind).toBe('refused');
    expect(ghost.position).toContain('hearts');
    expect(ghost.position).toContain('pip1');
    // The breadcrumb STAYS, because it is what tells you how far out to move.
    expect(ghost.path).toBe('screen › hud › hearts › pip1');
  });

});

describe('line 3 carries the one thing no other surface says', () => {
  it('warns that the drop lands in a template drawn N times', () => {
    const ghost = ghostFor(DOC, ['magic-bar'], { kind: 'flex', parentId: 'heart', index: 0 });
    expect(ghost.path).toBe('inside repeat ×8');
    expect(ghost.warn).toBe(true);
  });
});

describe('where the card sits', () => {
  it('is below-right of the cursor by +14, +18', () => {
    expect(ghostPosition({ x: 400, y: 300 }, { w: 1400, h: 900 }))
      .toEqual({ left: 414, top: 318, transform: 'translate(0, 0)' });
  });

  it('flips to above-left within 150 px of the viewport edge', () => {
    // The flip is a TRANSLATION, so the card never has to be laid out once to
    // find out how wide it is. That is what would make it lag the cursor.
    expect(ghostPosition({ x: 1380, y: 880 }, { w: 1400, h: 900 }))
      .toEqual({ left: 1366, top: 862, transform: 'translate(-100%, -100%)' });
    expect(ghostPosition({ x: 1380, y: 300 }, { w: 1400, h: 900 }).transform)
      .toBe('translate(-100%, 0)');
  });
});

describe('the card itself', () => {
  it('renders nothing at all when nothing is being dragged', () => {
    mount(h(DragGhost, { model: null }));
    expect(document.querySelector('.hud-ghost')).toBeNull();
  });

  it('draws three lines, in order, once the cursor has reported', () => {
    mount(h(DragGhost, { model: ghostFor(DOC, ['magic-bar'], { kind: 'flex', parentId: 'hud', index: 1 }) }));
    act(() => {
      window.dispatchEvent(new MouseEvent('pointermove', { clientX: 200, clientY: 100 }));
    });
    const card = document.querySelector('.hud-ghost');
    expect(card).not.toBeNull();
    expect(card?.querySelector('.hud-ghost__chip')?.textContent).toBe('magic-bar');
    expect(card?.querySelector('.hud-ghost__kind')?.textContent).toBe('into column');
    expect(card?.querySelector('.hud-ghost__l2')?.textContent).toBe('position 2 of 2');
    expect(card?.querySelector('.hud-ghost__l3')?.textContent).toBe('screen › hud');
  });

  it('turns the whole card on a refusal, so the state reads in peripheral vision', () => {
    const intent = outlineIntent(DOC, 'pip1', 'inside-start', ['hearts']);
    mount(h(DragGhost, { model: ghostFor(DOC, ['hearts'], intent) }));
    act(() => {
      window.dispatchEvent(new MouseEvent('pointermove', { clientX: 200, clientY: 100 }));
    });
    expect(document.querySelector('.hud-ghost.is-refused')).not.toBeNull();
  });
});

/**
 * THE OUTLINE, DRIVEN END TO END. The jsdom limitation §43.8 recorded is
 * worked around here instead of lived with.
 *
 * `rowUnder` asks `document.elementFromPoint`, which jsdom does not implement,
 * so phase 2 could only cover the outline's pointer path structurally. It is
 * implementable in about six lines HERE, though, because the outline is a flat
 * list of fixed-height rows: give every row a rect and answer the lookup from
 * the y coordinate. That is not the browser's hit testing, since it cannot see
 * overlap, scrolling or a row hidden behind something. It is exactly the
 * question `rowUnder` asks, and it turns "the ghost is wired up" from an
 * assertion into a test.
 */
const ROW = 22;
const PLATFORM = { info: { os: 'windows' } } as unknown as Platform;

const rowsInOrder = (): HTMLElement[] =>
  Array.from(document.querySelectorAll('[data-outline-row]')) as HTMLElement[];

const layOutRows = (): void => {
  rowsInOrder().forEach((row, index) => {
    row.getBoundingClientRect = () => ({
      x: 0, y: index * ROW, width: 200, height: ROW, top: index * ROW, left: 0,
      right: 200, bottom: (index + 1) * ROW, toJSON: () => ({}),
    }) as DOMRect;
  });
  document.elementFromPoint = (_x: number, y: number) => rowsInOrder()[Math.floor(y / ROW)] ?? null;
};

const rowFor = (id: string): { element: HTMLElement; top: number } => {
  const rows = rowsInOrder();
  const index = rows.findIndex((row) => row.dataset.outlineRow === id);
  if (index < 0) throw new Error(`no row for ${id}`);
  return { element: rows[index], top: index * ROW };
};

const pointer = (type: string, y: number): MouseEvent =>
  new MouseEvent(type, { bubbles: true, cancelable: true, clientX: 40, clientY: y });

/** Press on `from`, walk to a point inside `to`, release. */
const dragRow = (from: string, to: string, offset: number): void => {
  layOutRows();
  act(() => { rowFor(from).element.dispatchEvent(pointer('pointerdown', rowFor(from).top + 11)); });
  const target = rowFor(to).top + offset;
  for (const step of [8, 4, 0]) {
    act(() => { window.dispatchEvent(pointer('pointermove', target + step)); });
  }
};

describe('the outline, with a ghost on it', () => {
  const mountOutline = (onDrop: (ids: readonly string[], intent: unknown) => void): void => {
    mount(h(PlatformContext.Provider, { value: PLATFORM }, h(OutlinePanel, {
      doc: DOC,
      selectedId: null,
      slotNumbers: [],
      onSelect: () => {},
      onRemove: () => {},
      onDrop,
    })));
  };

  it('names the container and the position it is promising', () => {
    const onDrop = vi.fn();
    mountOutline(onDrop);
    // The lower half of `hearts`' own middle band: into hearts, at the back.
    dragRow('magic-bar', 'hearts', 14);
    expect(document.querySelector('.hud-ghost__kind')?.textContent).toBe('into row');
    expect(document.querySelector('.hud-ghost__l2')?.textContent).toBe('position 3 of 3');
    act(() => { window.dispatchEvent(pointer('pointerup', rowFor('hearts').top + 14)); });
    expect(onDrop).toHaveBeenCalledWith(['magic-bar'], { kind: 'flex', parentId: 'hearts', index: 2 });
  });

  it('STOPS SILENTLY SWALLOWING A REFUSED DROP, which is the loop §43 left open', () => {
    // The shipped code lit an `inside` highlight over a drop `moveNode` would
    // then discard; §43 removed the highlight and left the refusal with no
    // feedback at all, on the understanding that the ghost would be the answer.
    // This is that answer: the card turns, and it names both nodes.
    const onDrop = vi.fn();
    mountOutline(onDrop);
    dragRow('hud', 'hearts', 14);
    const card = document.querySelector('.hud-ghost.is-refused');
    expect(card).not.toBeNull();
    expect(card?.querySelector('.hud-ghost__l2')?.textContent).toBe('hearts is already inside hud');
    expect(card?.querySelector('.hud-ghost__l3')?.textContent).toBe('screen › hud › hearts');
    // And no row is lit, because a refused drop promises nothing.
    expect(document.querySelector('.hud-outline__row.is-drop-inside')).toBeNull();
  });

  it('shows nothing at all before the slop threshold', () => {
    const onDrop = vi.fn();
    mountOutline(onDrop);
    layOutRows();
    act(() => { rowFor('magic-bar').element.dispatchEvent(pointer('pointerdown', rowFor('magic-bar').top + 11)); });
    expect(document.querySelector('.hud-ghost')).toBeNull();
    act(() => { window.dispatchEvent(pointer('pointerup', rowFor('magic-bar').top + 11)); });
    expect(onDrop).not.toHaveBeenCalled();
  });
});

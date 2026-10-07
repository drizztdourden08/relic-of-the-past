/* @layer test @kind test */
/**
 * THE SCREEN: the document's one root, always exactly the view.
 *
 * The thing worth pinning is that it is not a special case in the engine - it
 * is placed like any other container, it inherits opacity into what sits on it,
 * and its padding is the one inset everything below it sits inside. The other
 * half is the lock: the screen has no size to author, and a document that tries
 * is refused by name, not ignored, because a silently dropped
 * key is how a hand-edited file starts lying to its author.
 *
 * ITS ENGINE IS NOT LOCKED (§42, reversing §38.4). The screen is a grid whose
 * `[auto, fill, auto]` template IS the nine anchors, so `layout`, `columns` and
 * `rows` are the whole of how a layout is arranged - the last case here proves
 * a screen may name its own.
 */
import { describe, expect, it } from 'vitest';
import { layoutHud } from '@shared/hud/engine';
import { tryLoadLayout, validateLayout } from '@shared/hud/layouts';
import type { HudContainer, HudLayout } from '@shared/types/hud';

const VIEW = { w: 398, h: 224 };

const marker: HudContainer = {
  id: 'marker', kind: 'container', direction: 'row', size: { w: { px: 10 }, h: { px: 10 } }, children: [],
};

/** The screen's default template: the 3x3 the nine anchors always were. */
const BANDS = {
  layout: 'grid' as const,
  columns: ['auto', 'fill', 'auto'] as const,
  rows: ['auto', 'fill', 'auto'] as const,
  justifyItems: 'start' as const,
  alignItems: 'start' as const,
};

const screenOf = (extra: Partial<HudContainer>, child: Partial<HudContainer> = {}): HudContainer => ({
  id: 'screen',
  kind: 'container',
  ...BANDS,
  columns: [...BANDS.columns],
  rows: [...BANDS.rows],
  children: [{ ...marker, place: { column: 1, row: 1 }, ...child }],
  ...extra,
} as HudContainer);

const docWith = (screen: Partial<HudContainer> = {}, child: Partial<HudContainer> = {}): HudLayout => ({
  id: 'test', name: 'Test', builtIn: false, screen: screenOf(screen, child),
});

describe('the screen root', () => {
  it('is placed at exactly the view, whatever the view is', () => {
    const placed = layoutHud(docWith(), VIEW);
    expect(placed.find((node) => node.id === 'screen')?.rect).toEqual({ x: 0, y: 0, w: 398, h: 224 });

    const wide = layoutHud(docWith(), { w: 512, h: 240 });
    expect(wide.find((node) => node.id === 'screen')?.rect).toEqual({ x: 0, y: 0, w: 512, h: 240 });
  });

  it('draws first, so everything else sits on top of it', () => {
    expect(layoutHud(docWith(), VIEW)[0]?.id).toBe('screen');
  });

  it('insets everything below it by its padding - one safe area, in one place', () => {
    const padded = layoutHud(docWith({ padding: { top: 8, right: 8, bottom: 8, left: 8 } }), VIEW);
    expect(padded.find((node) => node.id === 'marker')?.rect).toMatchObject({ x: 8, y: 8 });

    const bottomRight = layoutHud(
      docWith(
        { padding: { top: 8, right: 8, bottom: 8, left: 8 } },
        { place: { column: 3, row: 3 }, alignSelf: 'end' },
      ),
      VIEW,
    );
    // 398 - 8 (padding) - 10 (the marker) = 380; 224 - 8 - 10 = 206.
    expect(bottomRight.find((node) => node.id === 'marker')?.rect).toMatchObject({ x: 380, y: 206 });
  });

  it('multiplies its opacity into its children, the way any container does', () => {
    const placed = layoutHud(docWith({ opacity: 0.5 }), VIEW);
    expect(placed.find((node) => node.id === 'marker')?.opacity).toBeCloseTo(0.5);
  });

  it('takes the whole HUD with it when it is hidden - the root\'s one privilege', () => {
    expect(layoutHud(docWith({ visible: false }), VIEW)).toEqual([]);
  });

  it('carries a background like any other box, because it IS any other box', () => {
    // A Paint is any CSS colour string; a token keeps the lint rule that guards
    // real inline styles from having to tell this document apart from one.
    const doc = docWith({ style: { background: 'var(--c-surface)' } });
    expect(doc.screen.style?.background).toBe('var(--c-surface)');
    expect(layoutHud(doc, VIEW).find((node) => node.id === 'screen')).toBeDefined();
  });

  it('may be a flex container instead - its engine is the author\'s (§42)', () => {
    const doc: HudLayout = {
      id: 'test',
      name: 'Test',
      builtIn: false,
      screen: { id: 'screen', kind: 'container', direction: 'column', children: [marker] },
    };
    expect(validateLayout(doc).errors).toEqual([]);
    expect(layoutHud(doc, VIEW).find((node) => node.id === 'marker')?.rect).toMatchObject({ x: 0, y: 0 });
  });
});

describe('the screen lock', () => {
  const validated = (screen: Record<string, unknown>) => validateLayout({
    id: 'test', name: 'Test', builtIn: false,
    screen: { ...screenOf({}), ...screen },
  });

  it('accepts a plain screen', () => {
    expect(validated({}).errors).toEqual([]);
  });

  it.each(['size', 'min', 'max', 'margin', 'scale', 'place', 'order', 'alignSelf', 'justifySelf', 'dimWhenEmpty'])(
    'refuses %s by name instead of ignoring it',
    (key) => {
      const value = key === 'size' ? { w: { px: 10 } }
        : key === 'min' || key === 'max' ? { w: 10 }
          : key === 'margin' ? { top: 1 }
            : key === 'place' ? { column: 1, row: 1 }
              : key === 'alignSelf' || key === 'justifySelf' ? 'center'
                : key === 'dimWhenEmpty' ? [1] : 2;
      const { doc, errors } = validated({ [key]: value });
      expect(doc).toBeNull();
      expect(errors.some((e) => e.startsWith(`layout.screen.${key}:`))).toBe(true);
    },
  );

  it('refuses a screen that is not a container - it is the box the layout sits in', () => {
    const { doc, errors } = validateLayout({
      id: 'test', name: 'Test', builtIn: false,
      screen: { id: 'screen', kind: 'element', element: { type: 'spacer' } },
    });
    expect(doc).toBeNull();
    expect(errors.some((e) => e.includes('layout.screen'))).toBe(true);
  });

  it('refuses a document with no screen at all - there is nowhere to draw', () => {
    const { doc, errors } = validateLayout({ id: 'test', name: 'Test', builtIn: false });
    expect(doc).toBeNull();
    expect(errors.some((e) => e.startsWith('layout.screen:'))).toBe(true);
  });

  it('holds the screen to the same id uniqueness as everything else', () => {
    const { doc, errors } = validateLayout({
      id: 'test', name: 'Test', builtIn: false,
      screen: { ...screenOf({}), id: 'marker' },
    });
    expect(doc).toBeNull();
    expect(errors.length).toBeGreaterThan(0);
  });
});

describe('a pre-§42 document opens, and opens in the new shape', () => {
  /** `regions[]` beside a `stack` screen - what every stored layout looks like
   *  until the first save after this change. */
  const stored = {
    id: 'stored',
    name: 'Stored',
    builtIn: false,
    screen: { id: 'screen', kind: 'container', direction: 'stack', children: [] },
    regions: [
      { anchor: 'top-left', root: { ...marker, id: 'tl' } },
      { anchor: 'bottom-right', root: { ...marker, id: 'br' } },
      { anchor: 'center', root: { ...marker, id: 'mid' } },
    ],
  };

  it('folds every region into the screen, at the cell its anchor named', () => {
    const result = tryLoadLayout(stored);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.doc.screen.children.map((child) => child.id)).toEqual(['tl', 'br', 'mid']);
    expect(result.doc.screen.children.map((child) => child.place))
      .toEqual([
        { column: 1, row: 1 },
        { column: 3, row: 3 },
        // A centred band spans its whole axis FROM TRACK 1, so it centres in
        // the VIEW the way `center` always did instead of inside the middle
        // track alone - which would drift the moment the two outer bands
        // stopped being the same width.
        { column: 1, row: 1, colSpan: 3, rowSpan: 3 },
      ]);
    // NO ALIAS SURVIVES: `regions` is not a key of the document any more, and
    // no node under it still names `stack`.
    expect(JSON.stringify(result.doc)).not.toContain('regions');
    expect(JSON.stringify(result.doc)).not.toContain('stack');
  });

  it('draws each of the nine exactly where its anchor drew it', () => {
    const result = tryLoadLayout(stored);
    if (!result.ok) throw new Error(result.errors.join('\n'));
    const placed = layoutHud(result.doc, VIEW, {});
    const rect = (id: string) => placed.find((node) => node.id === id)?.rect;
    expect(rect('tl')).toMatchObject({ x: 0, y: 0 });
    expect(rect('br')).toMatchObject({ x: 388, y: 214 });
    expect(rect('mid')).toMatchObject({ x: 194, y: 107 });
  });
});

/* @layer test @kind test */
import { describe, expect, it } from 'vitest';
import { layoutHud, validateLayout } from '@rotp/hud';
import type { HudContainer, HudLayout } from '@rotp/hud';

const VIEW = { w: 398, h: 224 };

const marker: HudContainer = {
  id: 'marker', kind: 'container', direction: 'row', size: { w: { px: 10 }, h: { px: 10 } }, children: [],
};

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

const REFUSED_VALUES: Readonly<Record<string, unknown>> = {
  size: { w: { px: 10 } },
  min: { w: 10 },
  max: { w: 10 },
  margin: { top: 1 },
  place: { column: 1, row: 1 },
  alignSelf: 'center',
  justifySelf: 'center',
  dimWhenEmpty: [1],
};

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
      const { doc, errors } = validated({ [key]: REFUSED_VALUES[key] ?? 2 });
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

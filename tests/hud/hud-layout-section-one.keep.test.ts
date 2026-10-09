/* @layer tests @kind test */
import { describe, expect, it, vi } from 'vitest';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { LayoutSection } from '../../apps/desktop/src/ui/domains/app/views/HudLayoutEditor/sub-components/sections/LayoutSection';
import { PlatformContext } from '../../apps/desktop/src/platform/PlatformProvider';
import type { Platform } from '../../shared/platform';
import type { HudContainer, HudGridContainer } from '../../shared/types/hud';

interface ViewSnapshot { gridOverlayEnabled: boolean; toggleGridOverlay: () => void }
vi.mock('@app/stores/hud-editor-view-store', () => ({
  EDITOR_STEPS: [1, 2, 4, 8],
  useHudEditorViewStore: (select: (s: ViewSnapshot) => unknown) =>
    select({ gridOverlayEnabled: true, toggleGridOverlay: () => {} }),
}));

const noop = (): void => {};
const PLATFORM = { info: { os: 'windows' } } as unknown as Platform;

const GRID: HudGridContainer = {
  kind: 'container', id: 'screen', layout: 'grid',
  columns: ['auto', 'fill'], rows: ['auto'], children: [],
};
const FLEX = { kind: 'container', id: 'f', direction: 'row', children: [] } as unknown as HudContainer;

const render = (node: HudContainer): string => renderToStaticMarkup(
  h(PlatformContext.Provider, { value: PLATFORM },
    h(LayoutSection, { node, onPatch: noop, scope: {} })) as never,
);

const sectionOne = (markup: string): string =>
  markup.slice(0, markup.indexOf('class="hud-subsec"', markup.indexOf('class="hud-subsec"') + 1));

const labels = (markup: string): string[] =>
  Array.from(sectionOne(markup).matchAll(/hud-layout-set__label">([^<]*)</g)).map((m) => m[1]);

const barLit = (markup: string): string => markup
  .replace(/aria-pressed="(true|false)"/g, '')
  .replace(/ ?icon-btn--active/g, '')
  .replace(/\s+/g, ' ');

describe('section one holds the three questions every container answers', () => {
  it('labels every piece, because §55 deleted all three labels and left icon clusters', () => {
    expect(labels(render(GRID))).toEqual(['Type', 'Overlay', 'Gap']);
    expect(labels(render(FLEX))).toEqual(['Type', 'Overlay', 'Gap']);
  });

  it('puts the engine toggle first, and no alignment tile anywhere in it', () => {
    const one = sectionOne(render(GRID));
    expect(one).toContain('data-engine="grid"');
    expect(one.indexOf('data-engine')).toBeLessThan(one.indexOf('aria-label="gap x"'));
    expect(one).not.toContain('data-align=');
  });

  it('draws TWO gap cells under both engines, because `x` is horizontal either way', () => {
    for (const node of [GRID, FLEX]) {
      const one = sectionOne(render(node));
      expect((one.match(/hud-layout-set__gap\b/g) ?? []).length).toBe(2);
      expect(one).toContain('aria-label="gap x"');
      expect(one).toContain('aria-label="gap y"');
    }
  });

  it('offers the overlay under both engines, because it draws a flex container too', () => {
    for (const node of [GRID, FLEX]) {
      expect(sectionOne(render(node))).toContain('data-action="grid-overlay"');
    }
  });
});

describe('pressing Type changes which button is lit, and NOTHING else here', () => {
  it('renders section one identically for a grid and for a flex container', () => {
    expect(barLit(sectionOne(render(FLEX)))).toBe(barLit(sectionOne(render(GRID))));
  });

  it('still lights the button that was actually pressed', () => {
    expect(sectionOne(render(GRID))).toMatch(/aria-pressed="true"[^>]*data-engine="grid"/);
    expect(sectionOne(render(FLEX))).toMatch(/aria-pressed="true"[^>]*data-engine="flex"/);
  });
});

/* @layer tests @kind test */
/**
 * SECTION ONE IS BYTE FOR BYTE THE SAME SECTION UNDER BOTH ENGINES, BAR WHICH
 * BUTTON IS LIT (§58). The maintainer, for the seventh time:
 *
 * > "THE FUCKING OPTIONS GO BY CONCERNS. NOTHING IN A FUCKING SECTION SHOULD
 * > CHANGE WHEN CLICKING ANY FUCKING OTHER OPTION IN THAT SAME FUCKING SECTION!"
 *
 * WHAT §56 ASSERTED HERE WAS THE BREAKAGE, WRITTEN DOWN AS A FEATURE: "differs
 * only in the gap cell count and the grid-only overlay". Pressing TYPE is an
 * option IN this section, so a second gap field appearing and a whole Overlay
 * piece vanishing is precisely the rule being broken. A test that pinned it
 * is why six rounds passed every gate and were sent back anyway.
 *
 * SO THE CLAIM IS INVERTED. Render section one for a grid and for a flex
 * container, strip the two `aria-pressed` flags and the active class the type
 * toggle wears, and the markup must be IDENTICAL. That is the strongest form of
 * the rule available without a browser, and it fails the moment anybody puts an
 * engine-specific control back in the first section.
 *
 * THE BEHAVIOUR THOSE CONTROLS HAVE is `hud-grid-settings.keep.test.ts`, the
 * geometry is `hud-grid-strip`, and the stage's own reaction to each option is
 * the real-app spec `tests/e2e/hud-layout-options.keep.spec.ts`.
 */
import { describe, expect, it, vi } from 'vitest';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { LayoutSection } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components/sections/LayoutSection';
import { PlatformContext } from '../../apps/web/src/platform/PlatformProvider';
import type { Platform } from '../../shared/platform';
import type { HudContainer, HudGridContainer } from '../../shared/types/hud';

interface ViewSnapshot { gridOverlayEnabled: boolean; toggleGridOverlay: () => void }
vi.mock('@app/stores/hud-editor-view-store', () => ({
  EDITOR_STEPS: [1, 2, 4, 8],
  useHudEditorViewStore: (select: (s: ViewSnapshot) => unknown) =>
    select({ gridOverlayEnabled: true, toggleGridOverlay: () => {} }),
}));

const noop = (): void => {};
// Both engines mount a manipulation component, and both selection hooks ask the
// platform for the modifier key's name. Section four is not what this is about.
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

/** Section one only, meaning everything before the SECOND sub-section's own wrapper.
 *  Cut at the wrapper instead of at the title: the `<div>` carries the next
 *  section's `aria-label`, which is `Alignment` under a grid and `Flow` under a
 *  flex container, and slicing past it would make section one look different
 *  because of a section that is not section one. */
const sectionOne = (markup: string): string =>
  markup.slice(0, markup.indexOf('class="hud-subsec"', markup.indexOf('class="hud-subsec"') + 1));

const labels = (markup: string): string[] =>
  Array.from(sectionOne(markup).matchAll(/hud-layout-set__label">([^<]*)</g)).map((m) => m[1]);

/** The one thing pressing Type is ALLOWED to change: which button is lit. */
const barLit = (markup: string): string => markup
  .replace(/aria-pressed="(true|false)"/g, '')
  .replace(/icon-btn--active/g, '')
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
    // Alignment is section THREE's: it means a different thing under each
    // engine, which is what "specific" means.
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
    // §57 gave `ContainerOverlay` a flex drawing (each child's placed slot), so
    // the control is no longer a lie under the flow engine and the gate is gone.
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

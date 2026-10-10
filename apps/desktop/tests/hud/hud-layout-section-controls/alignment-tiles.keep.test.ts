/* @layer tests @kind test */
import { describe, expect, it, vi } from 'vitest';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { FLEX_ALIGN, FLEX_JUSTIFY, GRID_ITEMS } from '@app/hud-layout-editing/align-options';
import { LayoutSection } from '@app/views/HudLayoutEditor/sub-components/sections/LayoutSection';
import { PlatformContext } from '@drizztdourden08/brock-react';
import { PLATFORM } from './section-controls.constants';

interface ViewSnapshot {
  gridOverlayEnabled: boolean;
  editorStep: number;
  toggleGridOverlay: () => void;
}
vi.mock('@app/stores/hud-editor-view-store', () => ({
  EDITOR_STEPS: [1, 2, 4, 8],
  useHudEditorViewStore: (select: (s: ViewSnapshot) => unknown) =>
    select({ gridOverlayEnabled: true, editorStep: 1, toggleGridOverlay: () => {} }),
}));

const noop = (): void => {};

describe('the alignment tiles offer the values the engine has, and no others', () => {
  it('lists four per grid axis, six on a flex main axis and three on its cross', () => {
    expect(GRID_ITEMS.map((o) => o.value)).toEqual(['start', 'center', 'end', 'stretch']);
    expect(FLEX_JUSTIFY.map((o) => o.value))
      .toEqual(['start', 'center', 'end', 'between', 'around', 'evenly']);
    expect(FLEX_ALIGN.map((o) => o.value)).toEqual(['start', 'center', 'end']);
    expect(FLEX_ALIGN.some((o) => o.value === 'stretch')).toBe(false);
  });

  it('renders one tile per value, each naming what it writes', () => {
    const markup = renderToStaticMarkup(h(PlatformContext.Provider, { value: PLATFORM },
      h(LayoutSection, {
        node: { kind: 'container', id: 'row-1', direction: 'row', children: [] },
        onPatch: noop, onPatchNode: noop, scope: {},
      })) as never);
    for (const option of FLEX_JUSTIFY) {
      expect(markup).toContain(`data-align="justify:${option.value}"`);
    }
    for (const option of FLEX_ALIGN) {
      expect(markup).toContain(`data-align="align:${option.value}"`);
    }
    expect((markup.match(/data-align="/g) ?? []).length).toBe(9);
    expect(markup).not.toContain('data-align="justifyItems');
    expect(markup).not.toContain('data-action="align-extra"');
  });

  it('turns the flex diagrams with `direction`, because the axes turn with it', () => {
    const render = (direction: 'row' | 'column'): string => renderToStaticMarkup(
      h(PlatformContext.Provider, { value: PLATFORM },
        h(LayoutSection, {
          node: { kind: 'container', id: 'f', direction, children: [] },
          onPatch: noop, onPatchNode: noop, scope: {},
        })) as never,
    );
    expect(render('row')).toContain('flex-direction:row;justify-content:space-between');
    expect(render('column')).toContain('flex-direction:column;justify-content:space-between');
    expect(render('row')).not.toContain('grid-template-columns');
  });

  it('draws a grid\'s two fixed axes instead, with stretch among them', () => {
    const markup = renderToStaticMarkup(h(PlatformContext.Provider, { value: PLATFORM },
      h(LayoutSection, {
        node: {
          kind: 'container', id: 'g', layout: 'grid', columns: ['auto'], children: [],
        },
        onPatch: noop, onPatchNode: noop, scope: {},
      })) as never);
    expect(markup).toContain('data-align="justifyItems:stretch"');
    expect(markup).toContain('data-align="alignItems:stretch"');
    expect((markup.match(/data-align="/g) ?? []).length).toBe(8);
  });
});

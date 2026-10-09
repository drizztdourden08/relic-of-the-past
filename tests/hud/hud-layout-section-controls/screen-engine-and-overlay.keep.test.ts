/* @layer tests @kind test */
import { describe, expect, it, vi } from 'vitest';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'fs';
import { ContainerOverlay } from '../../../apps/desktop/src/ui/domains/app/views/HudLayoutEditor/sub-components/ContainerOverlay';
import { LayoutSection } from '../../../apps/desktop/src/ui/domains/app/views/HudLayoutEditor/sub-components/sections/LayoutSection';
import { PlatformContext } from '@drizztdourden08/brock-react';
import type { HudFlexContainer, HudGridContainer } from '@shared/types/hud';
import type { PlacedNode } from '@shared/hud/engine';
import { ED, GUIDE, PLATFORM } from './section-controls.constants';
import { boxCell as cell } from './box-cell';

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

describe('the screen root chooses its engine like any other container (§42)', () => {
  const render = (direction = 'row'): string => renderToStaticMarkup(
    h(PlatformContext.Provider, { value: PLATFORM }, h(LayoutSection, {
      node: { kind: 'container', id: 'screen', direction, children: [] } as never,
      onPatch: noop, onPatchNode: noop, scope: {},
    })) as never,
  );

  it('no longer scrims engine or direction - §38.4\'s lock is lifted', () => {
    const markup = render();
    expect(markup).not.toContain('disabled-overlay');
    expect((markup.match(/disabled=""/g) ?? []).length).toBe(0);
  });

  it('has no `isScreen` left to reason about at all', () => {
    const src = readFileSync(`${ED}/sub-components/sections/LayoutSection.tsx`, 'utf8');
    expect(src).not.toContain('isScreen');
    expect(readFileSync(`${ED}/sub-components/NodeInspector.tsx`, 'utf8'))
      .toMatch(/<SizeBoxSection[\s\S]{0,240}?isScreen=\{isScreen\}/);
  });

  it('writes a real engine change through, for the screen like anything else', () => {
    const patches: unknown[] = [];
    const markup = renderToStaticMarkup(h(PlatformContext.Provider, { value: PLATFORM },
      h(LayoutSection, {
        node: { kind: 'container', id: 'screen', direction: 'row', children: [] } as never,
        onPatch: (patch: unknown) => patches.push(patch), onPatchNode: noop, scope: {},
      })) as never);
    expect(markup).toContain('engine');
    const src = readFileSync(`${ED}/sub-components/sections/LayoutSection.tsx`, 'utf8');
    expect(src).toContain('engineSwitchPatch(');
    expect(src).not.toMatch(/const to(Flex|Grid)/);
  });
});

describe('the guide colour reaches the overlay it names', () => {
  it('draws every line and cell in the grid\'s own guide.color', () => {
    const container: HudGridContainer = {
      kind: 'container', id: 'grid', layout: 'grid', columns: [{ px: 20 }, { px: 20 }],
      rows: [{ px: 10 }], guide: { show: true, color: GUIDE },
      children: [cell('a', { place: { column: 1, row: 1 } })],
    };
    const placed: PlacedNode[] = [
      { id: 'grid', node: container, rect: { x: 0, y: 0, w: 40, h: 10 }, scale: 1, opacity: 1, dimmed: false },
      { id: 'a', node: container.children[0], rect: { x: 0, y: 0, w: 10, h: 10 }, scale: 1, opacity: 1, dimmed: false },
    ];
    const markup = renderToStaticMarkup(h(ContainerOverlay, {
      container, placed, scale: 2, ctx: {},
    }) as never);
    expect(markup).toContain(GUIDE);
    expect(markup).not.toContain('#c064c0');
    expect(markup.match(/hud-overlay__line--v/g)).toHaveLength(3);
    expect(markup).toContain('left:40px');
    expect(markup).not.toContain('hud-overlay__cell');
    expect(markup).not.toContain('onClick');
  });

  it('draws a FLEX container\'s child slots, so the gaps between them show (§57)', () => {
    const container: HudFlexContainer = {
      kind: 'container', id: 'row', direction: 'row', gap: { x: 2, y: 6 },
      guide: { show: true, color: GUIDE },
      children: [cell('a'), cell('b')],
    };
    const placed: PlacedNode[] = [
      { id: 'row', node: container, rect: { x: 0, y: 0, w: 22, h: 10 }, scale: 1, opacity: 1, dimmed: false },
      { id: 'a', node: container.children[0], rect: { x: 0, y: 0, w: 10, h: 10 }, scale: 1, opacity: 1, dimmed: false },
      { id: 'b', node: container.children[1], rect: { x: 12, y: 0, w: 10, h: 10 }, scale: 1, opacity: 1, dimmed: false },
    ];
    const markup = renderToStaticMarkup(h(ContainerOverlay, {
      container, placed, scale: 2, ctx: {},
    }) as never);
    expect(markup.match(/hud-overlay__slot/g)).toHaveLength(2);
    expect(markup).toContain(GUIDE);
    expect(markup).not.toContain('#c064c0');
    expect(markup).toContain('left:1px');
    expect(markup).toContain('left:25px');
    expect(markup).toContain('width:18px');
    expect(readFileSync(`${ED}/sub-components/HudLayoutEditor.inspector.css`, 'utf8'))
      .toMatch(/\.hud-overlay__slot\s*\{[^}]*dashed/);
    expect(markup).not.toContain('hud-overlay__line');
    expect(markup).not.toContain('onClick');
  });
});

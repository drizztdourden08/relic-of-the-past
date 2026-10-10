/* @layer tests @kind test */
// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { act, createElement as h } from 'react';
import { readFileSync } from 'fs';
import { join } from 'path';
import { filesIn } from '../files-in';
import { PlacementSection } from '@app/views/HudLayoutEditor/sub-components/PlacementSection';
import { offsetOf, withOffset } from '@app/hud-layout-editing/offset';
import { EDITOR, FLEX_PARENT, GRID_PARENT } from './geometry.constants';
import { installPlatformHarness } from './install-platform-harness';
import { spacerNode as node } from './spacer-node';

const { mount, rerender } = installPlatformHarness();

const tsxIn = (dir: string): string[] => filesIn(dir, (name) => name.endsWith('.tsx') || name.endsWith('.ts'));

describe('a position is margin.left / margin.top, in one place', () => {
  it('reads an unset margin as the origin and writes zero back as absence', () => {
    expect(offsetOf(undefined)).toEqual({ x: 0, y: 0 });
    expect(offsetOf({ left: -12, top: 4, right: 2 })).toEqual({ x: -12, y: 4 });
    expect(withOffset({ left: -12, right: 2 }, { x: 0, y: 0 })).toEqual({ right: 2 });
    expect(withOffset(undefined, { x: 0, y: 0 })).toBeUndefined();
  });

  it('keeps the other two edges, and keeps negatives', () => {
    expect(withOffset({ right: 2, bottom: 3 }, { x: -12, y: -1 }))
      .toEqual({ right: 2, bottom: 3, left: -12, top: -1 });
  });

  it('clears both keys when the field is typed back to the origin', () => {
    const margin = { left: 4, top: 4, right: 9 };
    expect(withOffset(margin, { x: 12, y: -4 })).toEqual({ left: 12, top: -4, right: 9 });
    expect(withOffset(margin, { x: 0, y: 0 })).toEqual({ right: 9 });
  });

  it('is the only writer of those two keys in the editor', () => {
    const offenders = tsxIn(EDITOR)
      .filter((f) => !f.endsWith(`behavior${'/'}offset.ts`) && !f.endsWith('offset.ts'))
      .filter((f) => /margin\.(left|top)\s*=/.test(readFileSync(f, 'utf8')));
    expect(offenders).toEqual([]);
  });

  it('routes its one remaining writer through that one module', () => {
    const reads = (f: string): string => readFileSync(join(EDITOR, f), 'utf8');
    expect(reads('sub-components/OffsetField.tsx')).toContain("from '@app/hud-layout-editing/offset'");
    expect(reads('sub-components/StageSelection.tsx')).not.toMatch(/from '@app\/hud-layout-editing\/offset'/);
  });
});

describe('the placement section', () => {
  it('no longer offers `order`, because the outline is the ordering control', () => {
    const src = readFileSync(join(EDITOR, 'sub-components/PlacementSection.tsx'), 'utf8');
    expect(src).not.toContain('node.order');
    expect(src).not.toContain('label="order"');
    expect(src).not.toContain('onPatch({ order');
  });

  it('moves a band by writing its CELL - the same patch every grid child gets', () => {
    const onPatch = vi.fn();
    mount(h(PlacementSection, {
      node: node(), parent: GRID_PARENT, onPatch,
    }));
    const cell = document.querySelector('.hud-lattice__cell[data-column="3"][data-row="1"]');
    expect(cell).not.toBeNull();
    act(() => { cell?.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, cancelable: true })); });
    expect(onPatch).toHaveBeenCalledWith({ place: { column: 3, row: 1 } });
  });

  it('states the reason on the cell group and offers the way out of it', () => {
    mount(h(PlacementSection, {
      node: node(), parent: FLEX_PARENT, onPatch: () => {}, onSelectNode: () => {},
    }));
    const scrim = document.querySelector('.disabled-overlay__scrim');
    expect(scrim?.textContent).toContain('flex row');
    expect(scrim?.textContent).toContain("Open the parent's Layout");
    expect(document.querySelector('.hud-lattice__cell')).not.toBeNull();
  });

  it('offers no anchor dropdown at all - there are no nine anchors left (§42)', () => {
    mount(h(PlacementSection, { node: node(), parent: null, onPatch: () => {} }));
    expect(Array.from(document.querySelectorAll('.field__label')).map((l) => l.textContent))
      .not.toContain('anchor');
  });

  it('splits self-alignment into two axes under a grid, and one under flex', () => {
    mount(h(PlacementSection, { node: node(), parent: GRID_PARENT, onPatch: () => {} }));
    const labels = () => Array.from(document.querySelectorAll('.field__label')).map((l) => l.textContent);
    expect(labels()).toContain('align down');
    expect(labels()).toContain('align across');
    rerender(h(PlacementSection, {
      node: node(), parent: FLEX_PARENT, onPatch: () => {},
    }));
    expect(labels()).toContain('align self');
    expect(labels()).not.toContain('align across');
  });
});

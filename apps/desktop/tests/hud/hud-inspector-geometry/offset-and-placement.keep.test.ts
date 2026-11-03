/* @layer tests @kind test */
// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { act, createElement as h } from 'react';
import { PlacementSection } from '@app/views/HudLayoutEditor/sub-components/PlacementSection';
import { offsetOf, withOffset } from '@app/hud-layout-editing/offset';
import { GRID_PARENT } from './geometry.constants';
import { installPlatformHarness } from './install-platform-harness';
import { spacerNode as node } from './spacer-node';

const { mount } = installPlatformHarness();

describe('a position is margin.left / margin.top, in one place', { tags: ['critical'] }, () => {
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
});

describe('the placement section', { tags: ['standard'] }, () => {
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
});

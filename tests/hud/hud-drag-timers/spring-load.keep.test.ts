/* @layer tests @kind test */
// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { useHudEditorViewStore } from '../../../apps/web/src/stores/hud-editor-view-store';
import { ROW } from './drag-timers.constants';
import { installOutlineRig } from './install-outline-rig';

const { rowsInOrder, layOut, pointer, rowFor, mountOutline } = installOutlineRig();

describe('spring-load: a collapsed row opens after the dwell, and puts itself back', () => {
  const collapsed = (): ReadonlySet<string> => useHudEditorViewStore.getState().collapsedNodeIds;

  const hoverVault = (): void => {
    useHudEditorViewStore.setState({ collapsedNodeIds: new Set(['vault']) });
    layOut();
    const at = rowsInOrder().findIndex((row) => row.dataset.outlineRow === 'vault');
    act(() => { rowFor('a').dispatchEvent(pointer('pointerdown', 11)); });
    act(() => { window.dispatchEvent(pointer('pointermove', 40)); });
    act(() => { window.dispatchEvent(pointer('pointermove', at * ROW + 11)); });
  };

  it('waits 500 ms, shows the wait, then expands', () => {
    mountOutline();
    hoverVault();
    expect(document.querySelector('.hud-outline__caret.is-springing')).not.toBeNull();
    act(() => { vi.advanceTimersByTime(499); });
    expect(collapsed().has('vault')).toBe(true);
    act(() => { vi.advanceTimersByTime(1); });
    expect(collapsed().has('vault')).toBe(false);
    expect(document.querySelector('.hud-outline__caret.is-springing')).toBeNull();
  });

  it('RE-COLLAPSES on a drop that landed somewhere else', () => {
    mountOutline();
    hoverVault();
    act(() => { vi.advanceTimersByTime(500); });
    layOut();
    act(() => { window.dispatchEvent(pointer('pointermove', 11)); });
    act(() => { window.dispatchEvent(pointer('pointerup', 11)); });
    expect(collapsed().has('vault')).toBe(true);
  });

  it('LEAVES IT OPEN when the drop landed inside it, because folding it would hide the move', () => {
    mountOutline();
    hoverVault();
    act(() => { vi.advanceTimersByTime(500); });
    layOut();
    const at = rowsInOrder().findIndex((row) => row.dataset.outlineRow === 'vault');
    const lowerHalfOfVaultMiddleBand = at * ROW + 14;
    act(() => { window.dispatchEvent(pointer('pointermove', lowerHalfOfVaultMiddleBand)); });
    act(() => { window.dispatchEvent(pointer('pointerup', lowerHalfOfVaultMiddleBand)); });
    expect(collapsed().has('vault')).toBe(false);
  });

  it('puts it back on a CANCEL, because nothing landed', () => {
    mountOutline();
    hoverVault();
    act(() => { vi.advanceTimersByTime(500); });
    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    });
    expect(collapsed().has('vault')).toBe(true);
  });

  it('resets the dwell when the pointer leaves before it fires', () => {
    mountOutline();
    hoverVault();
    act(() => { vi.advanceTimersByTime(400); });
    act(() => { window.dispatchEvent(pointer('pointermove', 11)); });
    act(() => { vi.advanceTimersByTime(400); });
    expect(collapsed().has('vault')).toBe(true);
    expect(document.querySelector('.hud-outline__caret.is-springing')).toBeNull();
  });
});

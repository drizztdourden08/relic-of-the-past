/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import { columnMenu as menu } from './column-menu';

describe('the ColumnMenu entry list', () => {
  it('offers the two adds, remove, rename, the four moves, group, sort and the two sizings', () => {
    expect(menu().entries.map((entry) => entry.key)).toEqual([
      'add-before', 'add-after', 'remove', 'rename',
      'move-left', 'move-right', 'move-first', 'move-last',
      'group', 'sort-asc', 'sort-desc', 'fit', 'expand',
    ]);
  });

  it('carries nothing table-wide, because those live once, in the footer menu', () => {
    const keys = menu().entries.map((entry) => entry.key);
    expect(keys).not.toContain('clear-sort');
    expect(keys).not.toContain('clear-group');
    expect(keys).not.toContain('reset');
  });

  it('sizes this column to what it is showing, or to whatever is left over', () => {
    const { actions, byKey } = menu();
    byKey('fit').onClick?.();
    expect(actions.onFitToContent).toHaveBeenCalledWith('kind');
    byKey('expand').onClick?.();
    expect(actions.onExpandToFill).toHaveBeenCalledWith('kind');
  });

  it('greys out expanding a column that already takes the leftover width', () => {
    expect(menu().byKey('expand').disabled).toBe(false);
    expect(menu({ grow: true }).byKey('expand').disabled).toBe(true);
    expect(menu({ grow: true }).byKey('fit').disabled).toBe(false);
  });

  it('greys out fitting a column already in the persistent fit-to-content mode', () => {
    expect(menu().byKey('fit').disabled).toBe(false);
    expect(menu({ fit: true }).byKey('fit').disabled).toBe(true);
    expect(menu({ fit: true }).byKey('expand').disabled).toBe(false);
  });

  it('disables the moves the column cannot make', () => {
    const first = menu({ index: 0 });
    expect(first.byKey('move-left').disabled).toBe(true);
    expect(first.byKey('move-first').disabled).toBe(true);
    expect(first.byKey('move-right').disabled).toBe(false);
    const last = menu({ index: 2 });
    expect(last.byKey('move-last').disabled).toBe(true);
    expect(last.byKey('move-right').disabled).toBe(true);
  });

  it('swaps group for ungroup once the column is a grouping level', () => {
    expect(menu({ grouped: true }).entries.map((entry) => entry.key)).toContain('ungroup');
    expect(menu({ grouped: true }).entries.map((entry) => entry.key)).not.toContain('group');
  });

  it('adds a level instead of replacing: the only route to a multi-column sort', () => {
    const { actions, byKey } = menu();
    byKey('sort-asc').onClick?.();
    expect(actions.onSortDir).toHaveBeenCalledWith('kind', 'asc');
    expect(actions.onToggleSort).not.toHaveBeenCalled();
  });

  it('offers BOTH directions while the column is unsorted, and neither removes anything', () => {
    const { entries, byKey, actions } = menu();
    const keys = entries.map((entry) => entry.key);
    expect(keys).toContain('sort-asc');
    expect(keys).toContain('sort-desc');
    expect(keys).not.toContain('sort-remove');
    expect(byKey('sort-asc').label).toBe('Sort ascending');
    expect(byKey('sort-desc').label).toBe('Sort descending');
    byKey('sort-desc').onClick?.();
    expect(actions.onSortDir).toHaveBeenCalledWith('kind', 'desc');
  });

  it('offers only the OTHER direction once the column sorts ascending', () => {
    const asc = menu({ sortDir: 'asc' });
    const keys = asc.entries.map((entry) => entry.key);
    expect(keys).toContain('sort-desc');
    expect(keys).not.toContain('sort-asc');
    asc.byKey('sort-desc').onClick?.();
    expect(asc.actions.onSortDir).toHaveBeenCalledWith('kind', 'desc');
  });

  it('offers only the OTHER direction once the column sorts descending', () => {
    const desc = menu({ sortDir: 'desc' });
    const keys = desc.entries.map((entry) => entry.key);
    expect(keys).toContain('sort-asc');
    expect(keys).not.toContain('sort-desc');
    desc.byKey('sort-asc').onClick?.();
    expect(desc.actions.onSortDir).toHaveBeenCalledWith('kind', 'asc');
  });

  it('keeps a per-column removal alongside it, naming the direction it drops', () => {
    const asc = menu({ sortDir: 'asc' });
    expect(asc.byKey('sort-remove').label).toBe('Remove sort on this column (ascending)');
    asc.byKey('sort-remove').onClick?.();
    expect(asc.actions.onRemoveSort).toHaveBeenCalledWith('kind');
    expect(asc.actions.onSortDir).not.toHaveBeenCalled();

    expect(menu({ sortDir: 'desc' }).byKey('sort-remove').label)
      .toBe('Remove sort on this column (descending)');
  });

  it('closes before it acts, so the menu never lingers over its own change', () => {
    const { actions, byKey, onClose } = menu();
    byKey('remove').onClick?.();
    expect(onClose).toHaveBeenCalled();
    expect(actions.onRemove).toHaveBeenCalledWith('kind');
  });

  it('hands renaming back to the header cell instead of doing it itself', () => {
    const { actions, byKey, onStartRename } = menu();
    byKey('rename').onClick?.();
    expect(onStartRename).toHaveBeenCalled();
    expect(actions.onRename).not.toHaveBeenCalled();
  });
});

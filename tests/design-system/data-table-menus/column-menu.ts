/* @layer tests @kind helper */
import { vi } from 'vitest';
import {
  buildColumnMenuItems,
} from '@drizztdourden08/tessera/composites';
import type { MenuItem, ColumnActions } from '@drizztdourden08/tessera/composites';
import { entryLookup } from './entry-lookup';

const columnMenu = (overrides: Partial<Parameters<typeof buildColumnMenuItems>[0]> = {}) => {
  const actions: ColumnActions = {
    onToggleSort: vi.fn(), onSortDir: vi.fn(), onRemoveSort: vi.fn(), onAddColumnAt: vi.fn(),
    onRemove: vi.fn(), onMove: vi.fn(), onRename: vi.fn(),
    onGroupBy: vi.fn(), onUngroup: vi.fn(), onResize: vi.fn(), onPreviewResize: vi.fn(),
    onFitToContent: vi.fn(), onExpandToFill: vi.fn(), onSetDisplayField: vi.fn(),
  };
  const onClose = vi.fn();
  const onStartRename = vi.fn();
  const items = buildColumnMenuItems({
    path: 'kind', index: 1, columnCount: 3, grouped: false,
    actions, onStartRename, onClose, ...overrides,
  });
  const entries = items.filter((entry): entry is MenuItem => entry !== 'separator');
  return { actions, entries, byKey: entryLookup(entries), onClose, onStartRename };
};

export { columnMenu };

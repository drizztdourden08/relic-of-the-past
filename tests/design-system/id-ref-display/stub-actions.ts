/* @layer tests @kind helper */
import { vi } from 'vitest';
import type {
  ColumnActions,
} from '../../../apps/web/src/ui/design-system/composites/DataTable/DataTable.type';

const stubActions = (): ColumnActions => ({
  onToggleSort: vi.fn(), onSortDir: vi.fn(), onRemoveSort: vi.fn(), onAddColumnAt: vi.fn(),
  onRemove: vi.fn(), onMove: vi.fn(), onRename: vi.fn(), onGroupBy: vi.fn(), onUngroup: vi.fn(),
  onResize: vi.fn(), onPreviewResize: vi.fn(), onFitToContent: vi.fn(), onExpandToFill: vi.fn(),
  onSetDisplayField: vi.fn(),
});

export { stubActions };

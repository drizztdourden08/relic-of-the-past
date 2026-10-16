/* @layer renderer-components @kind types */
import type { ListItemRowActionVisibility } from '@drizztdourden08/tessera/composites';
import type { IconName } from '@drizztdourden08/tessera/primitives';

type SaveRowNoticeKind = 'deleted' | 'saved' | 'loaded';

interface SaveRowNotice {
  kind: SaveRowNoticeKind;
  onUndo: () => void;
}

interface SaveRowAction {
  id: string;
  icon: IconName;
  label: string;
  onSelect: () => void;
  shortcut?: string;
  disabledReason?: string;
}

interface SaveRowProps {
  rowKey: string;
  name: string;
  timestamp: number | null;
  screenshotUrl: string | null;
  busy?: boolean;
  selected?: boolean;
  tabIndex?: number;
  notice?: SaveRowNotice | null;
  renaming?: boolean;
  onActivate?: () => void;
  onRenameEnd?: (name: string | null) => void;
  actions?: readonly SaveRowAction[];
}

interface SaveRowLook {
  className: string;
  actionVisibility: ListItemRowActionVisibility;
  clickable: boolean;
}

type SaveRowRemovedProps = Pick<SaveRowProps, 'rowKey' | 'name' | 'screenshotUrl'> & { notice: SaveRowNotice };

interface SaveRowActionsProps {
  actions: readonly SaveRowAction[];
  tabIndex?: number;
}

interface SaveRowNoticeProps {
  notice: SaveRowNotice;
}

interface SaveRowRenameProps {
  name: string;
  onEnd: (name: string | null) => void;
}

interface SaveRowTimeProps {
  timestamp: number | null;
}

interface SaveRowThumbProps {
  src: string | null;
}

export type {
  SaveRowAction, SaveRowActionsProps, SaveRowLook, SaveRowNotice, SaveRowNoticeKind, SaveRowNoticeProps, SaveRowProps,
  SaveRowRemovedProps, SaveRowRenameProps, SaveRowThumbProps, SaveRowTimeProps,
};

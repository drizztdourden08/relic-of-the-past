/* @layer site-kit @kind types */
import type { GroupView } from '@rotp/hub-client';

type GroupRowProps = {
  group: GroupView;
  summary: string;
  busy: boolean;
  onEdit: (group: GroupView) => void;
  onDelete: (group: GroupView) => void;
};

export type { GroupRowProps };

/* @layer site-kit @kind types */
import type { GroupView } from '../../../api/hub-responses.type';

type GroupRowProps = {
  group: GroupView;
  summary: string;
  busy: boolean;
  onEdit: (group: GroupView) => void;
  onDelete: (group: GroupView) => void;
};

export type { GroupRowProps };

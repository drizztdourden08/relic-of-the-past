/* @layer renderer-components @kind types */
import type { IconName } from '@drizztdourden08/tessera/primitives';

interface DataSectionItem {
  id: string;
  title: string;
  icon: IconName;
  description: string;
}

interface DataSectionGroup {
  id: string;
  label: string;
  items: readonly DataSectionItem[];
}

interface DataSectionsProps {
  groups: readonly DataSectionGroup[];
  onOpen: (id: string) => void;
}

export type { DataSectionGroup, DataSectionItem, DataSectionsProps };

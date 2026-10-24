/* @layer renderer-components @kind types */
import type { PadFamily } from '@drizztdourden08/brock-input';

type DirectoryGroup = 'Connected' | 'Known';

interface DirectoryRow {
  id: string;
  name: string;
  vidPid: string;
  family: PadFamily;
  group: DirectoryGroup;
  connectedKey: string | null;
}

interface ControllerDirectoryProps {
  onOpenController?: (deviceKey: string) => void;
}

export type { ControllerDirectoryProps, DirectoryRow };

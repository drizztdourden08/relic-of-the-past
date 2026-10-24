/* @layer renderer-components @kind types */
import type { MappingSource, PadFamily } from '@drizztdourden08/brock-input';

type DirectoryGroup = 'Connected' | 'Known';

type DirectorySource = MappingSource | 'none';

interface DirectoryRow {
  id: string;
  name: string;
  vidPid: string;
  family: PadFamily;
  source: DirectorySource;
  inputs: number;
  group: DirectoryGroup;
  connectedKey: string | null;
}

interface ControllerDirectoryProps {
  onOpenController?: (deviceKey: string) => void;
}

export type { ControllerDirectoryProps, DirectoryRow };

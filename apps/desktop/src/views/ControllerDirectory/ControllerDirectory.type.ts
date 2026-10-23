/* @layer renderer-components @kind types */
import type { PadFamily } from '@drizztdourden08/brock-input';

type MappingSource = 'sdl' | 'bundled' | 'user';

interface MappingDbEntry {
  guid: string;
  name: string;
  vendorId: number;
  productId: number;
  family: PadFamily;
  source: MappingSource;
  mapping: string;
}

type DirectoryGroup = 'Connected' | 'Known';

interface DirectoryRow {
  id: string;
  name: string;
  vidPid: string;
  family: PadFamily;
  source: MappingSource;
  inputs: number;
  group: DirectoryGroup;
  connectedKey: string | null;
}

interface MappingEntries {
  entries: readonly MappingDbEntry[];
  complete: boolean;
}

interface ControllerDirectoryProps {
  onOpenController?: (deviceKey: string) => void;
}

export type { ControllerDirectoryProps, DirectoryRow, MappingDbEntry, MappingEntries };

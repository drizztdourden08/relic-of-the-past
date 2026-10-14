/* @layer renderer-components @kind types */
import type { MsuFileMetadata } from '@rotp/msu';
import type { useFileAudition } from './behavior/useFileAudition';
import type { useFileUsage } from './behavior/useFileUsage';

type FileListProps = {
  ready: boolean;
  shown: MsuFileMetadata[];
  fileCount: number;
  supersededOnly: boolean;
  filter: string;
  usage: ReturnType<typeof useFileUsage>;
  audition: ReturnType<typeof useFileAudition>;
  busy: boolean;
  readOnly: boolean;
  onRename: (from: string, to: string) => void;
  onDelete: (fileName: string) => void;
};

export type { FileListProps };

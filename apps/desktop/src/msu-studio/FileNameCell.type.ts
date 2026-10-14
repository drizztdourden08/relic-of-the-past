/* @layer renderer-components @kind types */
import type { FileRowProps } from './FileRow.type';
import type { useFileRename } from './behavior/useFileRename';

type FileNameCellProps = Pick<FileRowProps, 'busy' | 'readOnly'> & {
  name: string;
  rename: ReturnType<typeof useFileRename>;
};

export type { FileNameCellProps };

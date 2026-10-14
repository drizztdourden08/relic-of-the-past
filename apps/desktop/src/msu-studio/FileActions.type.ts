/* @layer renderer-components @kind types */
import type { FileRowProps } from './FileRow.type';

type FileActionsProps = Pick<FileRowProps, 'playing' | 'loading' | 'busy' | 'readOnly' | 'onPlay' | 'onDelete'> & {
  name: string;
};

export type { FileActionsProps };

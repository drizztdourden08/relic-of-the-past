/* @layer sanctuary-site @kind logic */
import { FILE_TYPES } from '@shared/sanctuary/file-types';
import type { FileType } from '@shared/sanctuary/file-types';

const isFileType = (id: string): id is FileType => (FILE_TYPES as readonly string[]).includes(id);

export { isFileType };

/* @layer sanctuary-site @kind logic */
import type { FileType } from '@shared/sanctuary/file-types';
import type { PatchOf } from './batch-edits.type';

const typePatch = (type: FileType): PatchOf => (file) => (file.type === type ? null : { type });

export { typePatch };

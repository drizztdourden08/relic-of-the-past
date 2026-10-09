/* @layer sanctuary-site @kind logic */
import { FILE_TYPES } from '@rotp/hub-contracts';
import type { FileType } from '@rotp/hub-contracts';

const isFileType = (id: string): id is FileType => (FILE_TYPES as readonly string[]).includes(id);

export { isFileType };

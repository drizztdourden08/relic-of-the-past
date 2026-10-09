/* @layer shared-sanctuary @kind logic */
import type { FileType } from '../file-types';
import type { FilePermission } from './sanctuary-rights.type';

const filePermission = (type: FileType): FilePermission => `files:${type}`;

export { filePermission };

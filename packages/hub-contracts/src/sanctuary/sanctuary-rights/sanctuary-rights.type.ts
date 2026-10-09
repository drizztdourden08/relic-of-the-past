/* @layer shared-sanctuary @kind types */
import type { FileType } from '../file-types';

type FilePermission = `files:${FileType}`;
type SanctuaryPermission = FilePermission | 'reports';

export type { SanctuaryPermission, FilePermission };

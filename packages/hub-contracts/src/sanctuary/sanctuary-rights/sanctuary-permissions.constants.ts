/* @layer shared-sanctuary @kind constants */
import { FILE_TYPES, FILE_TYPE_SHELF_LABELS } from '../file-types';
import { filePermission } from './file-permission';
import type { FilePermission, SanctuaryPermission } from './sanctuary-rights.type';

const REPORTS_PERMISSION = 'reports';

const FILE_PERMISSIONS: readonly FilePermission[] = FILE_TYPES.map(filePermission);

const PERMISSION_LABELS = {
  ...Object.fromEntries(FILE_TYPES.map((type) => [filePermission(type), FILE_TYPE_SHELF_LABELS[type]])),
  reports: 'Reports',
} as Record<SanctuaryPermission, string>;

export { REPORTS_PERMISSION, FILE_PERMISSIONS, PERMISSION_LABELS };

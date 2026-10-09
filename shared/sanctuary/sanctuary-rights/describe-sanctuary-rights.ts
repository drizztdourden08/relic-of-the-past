/* @layer shared-sanctuary @kind logic */
import { FILE_TYPES, FILE_TYPE_SHELF_LABELS } from '../file-types';
import { filePermission } from './file-permission';
import { REPORTS_PERMISSION } from './sanctuary-permissions.constants';

const typesText = (granted: readonly string[]): string => {
  const types = FILE_TYPES.filter((type) => granted.includes(filePermission(type)));
  if (types.length === 0) return 'no file types';
  if (types.length === FILE_TYPES.length) return 'all file types';
  return types.map((type) => FILE_TYPE_SHELF_LABELS[type]).join(', ');
};

const describeSanctuaryRights = (granted: readonly string[]): string =>
  [typesText(granted), ...(granted.includes(REPORTS_PERMISSION) ? ['reports'] : [])].join(' · ');

export { describeSanctuaryRights };

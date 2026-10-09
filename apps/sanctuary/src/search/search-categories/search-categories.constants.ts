/* @layer sanctuary-site @kind constants */
import type { IconifyIcon } from '@iconify/react/offline';
import hammerIcon from '@iconify-icons/lucide/hammer';
import saveIcon from '@iconify-icons/lucide/save';
import imageIcon from '@iconify-icons/lucide/image';
import musicIcon from '@iconify-icons/lucide/music';
import fileTextIcon from '@iconify-icons/lucide/file-text';
import fileIcon from '@iconify-icons/lucide/file';
import flagIcon from '@iconify-icons/lucide/flag';
import gamepadIcon from '@iconify-icons/lucide/gamepad-2';
import { FILE_TYPES, FILE_TYPE_SHELF_LABELS } from '@shared/sanctuary/file-types';
import type { FileType } from '@shared/sanctuary/file-types';
import type { ReportKind } from '@shared/sanctuary/report-types';
import { REPORT_SCOPE_IDS } from '../../pages/Reports/Reports.constants';
import type { SearchCategory } from './search-categories.type';

const FILES_PATH = '/files';
const REPORTS_PATH = '/reports';

const FILE_TYPE_ICONS: Record<FileType, IconifyIcon> = {
  build: hammerIcon,
  'save-state': saveIcon,
  sprite: imageIcon,
  music: musicIcon,
  document: fileTextIcon,
  other: fileIcon,
};

const FILE_CATEGORIES = Object.fromEntries(FILE_TYPES.map((type): [FileType, SearchCategory] => [type, {
  key: `files:${type}`,
  label: FILE_TYPE_SHELF_LABELS[type],
  icon: FILE_TYPE_ICONS[type],
  surface: 'files',
  scope: type,
  path: FILES_PATH,
}])) as Record<FileType, SearchCategory>;

const REPORT_CATEGORIES: Record<ReportKind, SearchCategory> = {
  player: {
    key: 'reports:player',
    label: 'Player reports',
    icon: flagIcon,
    surface: 'reports',
    scope: REPORT_SCOPE_IDS.player,
    path: REPORTS_PATH,
  },
  controller: {
    key: 'reports:controller',
    label: 'Controller reports',
    icon: gamepadIcon,
    surface: 'reports',
    scope: REPORT_SCOPE_IDS.controller,
    path: REPORTS_PATH,
  },
};

const REPORT_KINDS: readonly ReportKind[] = ['player', 'controller'];

const SEARCH_CATEGORIES: readonly SearchCategory[] = [
  ...FILE_TYPES.map((type) => FILE_CATEGORIES[type]),
  ...REPORT_KINDS.map((kind) => REPORT_CATEGORIES[kind]),
];

export { FILE_CATEGORIES, REPORT_CATEGORIES, REPORT_KINDS, SEARCH_CATEGORIES };

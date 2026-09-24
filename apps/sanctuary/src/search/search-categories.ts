/* @layer sanctuary-site @kind constants */
/**
 * What the global search groups its results by: every file type, then player reports and
 * controller reports. Each category is also a place to open, a list page on one scope tab.
 */
import type { IconifyIcon } from '@iconify/react/offline';
import hammerIcon from '@iconify-icons/lucide/hammer';
import saveIcon from '@iconify-icons/lucide/save';
import imageIcon from '@iconify-icons/lucide/image';
import musicIcon from '@iconify-icons/lucide/music';
import fileTextIcon from '@iconify-icons/lucide/file-text';
import fileIcon from '@iconify-icons/lucide/file';
import flagIcon from '@iconify-icons/lucide/flag';
import gamepadIcon from '@iconify-icons/lucide/gamepad-2';
import { FILE_TYPES } from '@shared/sanctuary/file-types';
import type { FileType } from '@shared/sanctuary/file-types';
import type { ReportKind } from '@shared/sanctuary/report-types';
import { SCOPE_TYPE_LABELS } from '../pages/Files/Files.constants';
import { REPORT_SCOPE_IDS } from '../pages/Reports/Reports.constants';
import type { ListSurface } from '../data/site-data-context';

type SearchCategory = {
  key: string;
  label: string;
  icon: IconifyIcon;
  surface: ListSurface;
  /** The scope tab the category opens on. */
  scope: string;
  /** The list page's path; a row opens at `<path>/<id>`. */
  path: string;
};

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

const fileCategory = (type: FileType): SearchCategory => ({
  key: `files:${type}`,
  label: SCOPE_TYPE_LABELS[type],
  icon: FILE_TYPE_ICONS[type],
  surface: 'files',
  scope: type,
  path: FILES_PATH,
});

const FILE_CATEGORIES = Object.fromEntries(FILE_TYPES.map((type) => [type, fileCategory(type)])) as Record<FileType, SearchCategory>;

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

/** Every category, in the order the results list them. */
const SEARCH_CATEGORIES: readonly SearchCategory[] = [
  ...FILE_TYPES.map((type) => FILE_CATEGORIES[type]),
  ...REPORT_KINDS.map((kind) => REPORT_CATEGORIES[kind]),
];

/** The categories whose own name holds the (lowercase) query, for a quick jump. */
const categoriesNamed = (query: string): SearchCategory[] =>
  SEARCH_CATEGORIES.filter((category) => category.label.toLowerCase().includes(query));

export { FILE_CATEGORIES, REPORT_CATEGORIES, REPORT_KINDS, SEARCH_CATEGORIES, categoriesNamed };
export type { SearchCategory };

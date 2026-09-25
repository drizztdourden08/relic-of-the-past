/* @layer sanctuary-site @kind constants */
/** One icon per file type, for a file drawn as a tile with no picture of its own. */
import type { IconifyIcon } from '@iconify/react/offline';
import packageIcon from '@iconify-icons/lucide/package';
import saveIcon from '@iconify-icons/lucide/save';
import imageIcon from '@iconify-icons/lucide/image';
import musicIcon from '@iconify-icons/lucide/music';
import fileTextIcon from '@iconify-icons/lucide/file-text';
import fileIcon from '@iconify-icons/lucide/file';
import type { FileType } from '@shared/sanctuary/file-types';

const FILE_TYPE_ICONS: Record<FileType, IconifyIcon> = {
  build: packageIcon,
  'save-state': saveIcon,
  sprite: imageIcon,
  music: musicIcon,
  document: fileTextIcon,
  other: fileIcon,
};

export { FILE_TYPE_ICONS };

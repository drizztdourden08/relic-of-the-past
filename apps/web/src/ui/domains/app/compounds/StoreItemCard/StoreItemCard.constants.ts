/* @layer renderer-components @kind constants */
/** How each kind of pack is named and drawn wherever the Hookshop shows one. */
import musicIcon from '@iconify-icons/lucide/music';
import personIcon from '@iconify-icons/lucide/person-standing';
import languagesIcon from '@iconify-icons/lucide/languages';
import type { StoreKind } from '@shared/store/types';

type KindIcon = typeof musicIcon;

const KIND_LABELS: Record<StoreKind, string> = {
  music: 'Music pack',
  character: 'Character',
  language: 'Language',
};

const KIND_ICONS: Record<StoreKind, KindIcon> = {
  music: musicIcon,
  character: personIcon,
  language: languagesIcon,
};

export { KIND_LABELS, KIND_ICONS };
export type { KindIcon };

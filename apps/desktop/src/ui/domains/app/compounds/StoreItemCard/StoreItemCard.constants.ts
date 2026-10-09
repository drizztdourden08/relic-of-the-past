/* @layer renderer-components @kind constants */
import musicIcon from '@iconify-icons/lucide/music';
import personIcon from '@iconify-icons/lucide/person-standing';
import languagesIcon from '@iconify-icons/lucide/languages';
import type { StoreKind } from '@rotp/hub-contracts';
import type { KindIcon } from './StoreItemCard.type';

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

/* @layer renderer-components @kind constants */
import musicIcon from '@iconify-icons/lucide/music';
import personIcon from '@iconify-icons/lucide/person-standing';
import languagesIcon from '@iconify-icons/lucide/languages';
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { Message } from '@drizztdourden08/brock-core/i18n';
import type { StoreKind } from '@rotp/hub-contracts';
import type { KindIcon } from './StoreItemCard.type';

const KIND_LABELS: Record<StoreKind, Message> = {
  music: msg('views-store:kind.music'),
  character: msg('views-store:kind.character'),
  language: msg('views-store:kind.language'),
};

const KIND_ICONS: Record<StoreKind, KindIcon> = {
  music: musicIcon,
  character: personIcon,
  language: languagesIcon,
};

export { KIND_LABELS, KIND_ICONS };

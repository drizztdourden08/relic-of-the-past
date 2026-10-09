/* @layer store-site @kind constants */
import type { StoreKind } from '@shared/store/types';
import type { ChipTone } from '@site-kit/components/Chip/Chip';

const KIND_TONES: Record<StoreKind, ChipTone> = { music: 'gold', character: 'green', language: 'info' };

export { KIND_TONES };

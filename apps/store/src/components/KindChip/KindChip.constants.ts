/* @layer store-site @kind constants */
import type { TagNormalColor } from '@drizztdourden08/tessera/primitives';
import type { StoreKind } from '@shared/store/types';

const KIND_TONES: Record<StoreKind, TagNormalColor> = { music: 'primary', character: 'secondary', language: 'tertiary' };

export { KIND_TONES };

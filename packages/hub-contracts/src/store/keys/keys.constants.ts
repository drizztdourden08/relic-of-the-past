/* @layer shared-store @kind constants */
import type { StoreKind } from '../types';

const KIND_FOLDER: Record<StoreKind, string> = { music: 'music', character: 'characters', language: 'languages' };

const PREFIX = { incoming: 'incoming/', packs: 'packs/', media: 'media/' } as const;

export { KIND_FOLDER, PREFIX };

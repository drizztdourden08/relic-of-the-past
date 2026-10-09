/* @layer store-site @kind constants */
import type { IconifyIcon } from '@iconify/react/offline';
import musicIcon from '@iconify-icons/lucide/music';
import characterIcon from '@iconify-icons/lucide/person-standing';
import languageIcon from '@iconify-icons/lucide/languages';
import type { StoreKind } from '@rotp/hub-contracts';

const STORE_KINDS: readonly StoreKind[] = ['music', 'character', 'language'];

const KIND_LABELS: Record<StoreKind, string> = { music: 'music', character: 'character', language: 'language' };

const KIND_PLURALS: Record<StoreKind, string> = { music: 'Music packs', character: 'Characters', language: 'Languages' };

const KIND_SECTIONS: Record<StoreKind, string> = { music: 'music', character: 'characters', language: 'languages' };

const KIND_ICONS: Record<StoreKind, IconifyIcon> = { music: musicIcon, character: characterIcon, language: languageIcon };

export { STORE_KINDS, KIND_LABELS, KIND_PLURALS, KIND_SECTIONS, KIND_ICONS };

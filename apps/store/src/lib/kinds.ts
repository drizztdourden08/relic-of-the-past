/* @layer store-site @kind constants */
/**
 * The three kinds as the site names and draws them: the label on a chip, the plural on a
 * tab and a section, the section a kind opens, its line icon and the file a pack of it is.
 */
import type { IconifyIcon } from '@iconify/react/offline';
import musicIcon from '@iconify-icons/lucide/music';
import characterIcon from '@iconify-icons/lucide/person-standing';
import languageIcon from '@iconify-icons/lucide/languages';
import type { StoreKind } from '@shared/store/types';

const STORE_KINDS: readonly StoreKind[] = ['music', 'character', 'language'];

const KIND_LABELS: Record<StoreKind, string> = { music: 'music', character: 'character', language: 'language' };

const KIND_PLURALS: Record<StoreKind, string> = { music: 'Music packs', character: 'Characters', language: 'Languages' };

/** The nav section each kind opens; also its path, `/<section>`. */
const KIND_SECTIONS: Record<StoreKind, string> = { music: 'music', character: 'characters', language: 'languages' };

const KIND_ICONS: Record<StoreKind, IconifyIcon> = { music: musicIcon, character: characterIcon, language: languageIcon };

const kindOfSection = (section: string): StoreKind | null =>
  STORE_KINDS.find((kind) => KIND_SECTIONS[kind] === section) ?? null;

export { STORE_KINDS, KIND_LABELS, KIND_PLURALS, KIND_SECTIONS, KIND_ICONS, kindOfSection };

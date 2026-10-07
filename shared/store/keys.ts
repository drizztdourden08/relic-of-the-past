/* @layer shared-store @kind logic */
/**
 * The store bucket's layout, the only place a key is spelled:
 *
 *   incoming/<itemId>/v<n>/<slug>-<semver>.<ext>          every upload lands here
 *   packs/<kind folder>/<itemId>/v<n>/<slug>-<semver>.<ext>   approved copies, what players get
 *   media/<itemId>/<card|banner>-<sha8>.webp              pictures, a new key per picture
 *
 * The file name in a key is the slug and version, so the bucket reads like a catalogue and a
 * download saves under a sensible name.
 */
import type { Container, StoreItem, StoreKind, StoreVersion } from './types';

const KIND_FOLDER: Record<StoreKind, string> = { music: 'music', character: 'characters', language: 'languages' };

const PREFIX = { incoming: 'incoming/', packs: 'packs/', media: 'media/' } as const;

type KeyItem = Pick<StoreItem, 'id' | 'slug' | 'kind'>;
type KeyVersion = Pick<StoreVersion, 'n' | 'semver' | 'container'>;
type MediaRole = 'card' | 'banner';

const packName = (item: Pick<StoreItem, 'slug'>, v: { semver: string; container: Container }): string =>
  `${item.slug}-${v.semver}.${v.container}`;

const STORE_KEYS = {
  incoming: (item: KeyItem, v: KeyVersion): string =>
    `${PREFIX.incoming}${item.id}/v${v.n}/${packName(item, v)}`,
  pack: (item: KeyItem, v: KeyVersion): string =>
    `${PREFIX.packs}${KIND_FOLDER[item.kind]}/${item.id}/v${v.n}/${packName(item, v)}`,
  media: (itemId: string, role: MediaRole, sha8: string): string =>
    `${PREFIX.media}${itemId}/${role}-${sha8}.webp`,
};

/** The folders an item owns under packs/ and media/, removed when the item is deleted. */
const itemFolders = (item: Pick<StoreItem, 'id' | 'kind'>): string[] => [
  `${PREFIX.packs}${KIND_FOLDER[item.kind]}/${item.id}/`,
  `${PREFIX.media}${item.id}/`,
];

/** Players are only ever handed download URLs for keys under packs/. */
const isPackKey = (key: string): boolean => key.startsWith(PREFIX.packs) && !key.includes('..');

export { KIND_FOLDER, STORE_KEYS, packName, itemFolders, isPackKey };
export type { MediaRole };

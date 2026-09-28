/* @layer shared-store @kind types */
/**
 * The store's catalogue: an item is one listing with its version history, and every version
 * and every listing change goes through review before players see it. Shared by the store
 * API, the store site and the app, so each reads the same record.
 */
import type { FileVersion } from '@shared/sanctuary/file-types';
import type { ListingEditState, Review } from './review-types';

/** What an item is, which decides where it installs. */
type StoreKind = 'music' | 'character' | 'language';

/** The file format a version ships in: one per kind. */
type Container = 'msul' | 'rsp' | 'rlang';

/** A signed-in account as the store shows it. Same shape as the Sanctuary's FileOwner. */
type Person = { userId: string; displayName: string };

/**
 * A picture in the bucket's media/ prefix, with its size so a page can reserve the space. The
 * bucket is private: the API adds a signed `url` to every picture it answers with, and never
 * stores one.
 */
type MediaRef = { key: string; width: number; height: number; url?: string };

/** What a version's manifest says, read when its upload completes and shown on the item. */
type MusicFacts = {
  kind: 'music';
  title: string;
  /** Music slots the pack fills. */
  trackCount: number;
  /** Game sounds the pack replaces, across every channel. */
  soundCount: number;
  /** Files the manifest lists, when it carries an inventory. */
  fileCount: number | null;
  /** Fills a slot in the Deluxe range. */
  deluxe: boolean;
};
type CharacterFacts = { kind: 'character'; title: string; author: string };
type LanguageFacts = { kind: 'language'; title: string; base: string; origin: 'rom' | 'custom' };
type KindFacts = MusicFacts | CharacterFacts | LanguageFacts;

/** Why a version has no file any more. */
type RemovalReason = 'deleted' | 'rejected-expired' | 'ready-expired' | 'pruned';

/** When a version's file left the bucket and why. `by` names who deleted it; null for the store's own jobs. */
type FileRemoval = { at: number; reason: RemovalReason; by: Person | null };

type StoreVersion = FileVersion & {
  /** Must increase from one version to the next. */
  semver: string;
  changelog: string;
  container: Container;
  /** null when the manifest could not be read. */
  facts: KindFacts | null;
  /** The key under packs/ once approved; null before that. */
  packKey: string | null;
  review: Review;
  /** Set once the file is gone from the bucket; the row stays as a trace. */
  removed: FileRemoval | null;
};

/** The text and pictures a player reads before installing. */
type Listing = {
  name: string;
  /** One line, shown on cards. */
  summary: string;
  description: string;
  tags: string[];
  license: string;
  /** The card's border and the placeholder's colour, `#rrggbb` (item-color.ts). */
  color: string;
  card: MediaRef | null;
  banner: MediaRef | null;
};

/** A change to a published listing, reviewed like a version. A draft changes directly. */
type ListingEdit = { id: string; patch: Partial<Listing>; review: Review<ListingEditState> };

type ItemStats = {
  installs: number;
  /** Installs over the last 30 days, recounted by the daily job. */
  installs30d: number;
  ratingCount: number;
  ratingSum: number;
  /** Count of 1 to 5 star ratings, index 0 holding the ones. */
  ratingHist: [number, number, number, number, number];
  /** Weighted average used for Top rated. */
  score: number;
};

type ItemStatus = 'draft' | 'waiting' | 'published' | 'unlisted';

type StoreItem = Listing & {
  id: string;
  kind: StoreKind;
  slug: string;
  author: Person;
  status: ItemStatus;
  /** Oldest first. */
  versions: StoreVersion[];
  /** The `n` of the approved version installs receive. */
  liveVersion: number | null;
  listingEdits: ListingEdit[];
  featured: { rank: number; by: Person; at: number } | null;
  stats: ItemStats;
  createdAt: number;
  publishedAt: number | null;
  updatedAt: number;
};

export type {
  StoreKind, Container, Person, MediaRef, MusicFacts, CharacterFacts, LanguageFacts, KindFacts,
  RemovalReason, FileRemoval, StoreVersion, Listing, ListingEdit, ItemStats, ItemStatus, StoreItem,
};

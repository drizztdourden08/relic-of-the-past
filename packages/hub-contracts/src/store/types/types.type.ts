/* @layer shared-store @kind types */
import type { FileVersion } from '../../sanctuary/file-types';
import type { ListingEditState, Review } from '../review-types';

type StoreKind = 'music' | 'character' | 'language';

type Container = 'msul' | 'rsp' | 'rlang';

type Person = { userId: string; displayName: string };

type MediaRef = { key: string; width: number; height: number; url?: string };

type MusicFacts = {
  kind: 'music';
  title: string;
  trackCount: number;
  soundCount: number;
  fileCount: number | null;
  deluxe: boolean;
};
type CharacterFacts = { kind: 'character'; title: string; author: string };
type LanguageFacts = { kind: 'language'; title: string; base: string; origin: 'rom' | 'custom' };
type KindFacts = MusicFacts | CharacterFacts | LanguageFacts;

type RemovalReason = 'deleted' | 'rejected-expired' | 'ready-expired' | 'pruned';

type FileRemoval = { at: number; reason: RemovalReason; by: Person | null };

type StoreVersion = FileVersion & {
  semver: string;
  changelog: string;
  container: Container;
  facts: KindFacts | null;
  packKey: string | null;
  review: Review;
  removed: FileRemoval | null;
};

type Listing = {
  name: string;
  summary: string;
  description: string;
  tags: string[];
  license: string;
  color: string;
  card: MediaRef | null;
  banner: MediaRef | null;
};

type ListingEdit = { id: string; patch: Partial<Listing>; review: Review<ListingEditState> };

type ItemStats = {
  installs: number;
  installs30d: number;
  ratingCount: number;
  ratingSum: number;
  ratingHist: [number, number, number, number, number];
  score: number;
};

type ItemStatus = 'draft' | 'waiting' | 'published' | 'unlisted';

type StoreItem = Listing & {
  id: string;
  kind: StoreKind;
  slug: string;
  author: Person;
  status: ItemStatus;
  versions: StoreVersion[];
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

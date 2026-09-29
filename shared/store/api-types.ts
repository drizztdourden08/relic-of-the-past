/* @layer shared-store @kind types */
/**
 * The answers of the store's routes, one type per route in STORE_ROUTES. store-api returns
 * these and the store site and the app read them, so the shape is agreed in one place.
 * Items come back projected: only the author, reviewers and admins see pending versions,
 * reviewers and review notes.
 */
import type { Container, ItemStats, Person, StoreItem, StoreKind } from './types';
import type { HomeSettings, HomeView, ItemCardView } from './home-types';
import type { Stars } from './rating-types';
import type { ReviewDecision } from './review-types';

type HomeResponse = HomeView;

type ItemsListResponse = { items: ItemCardView[]; nextCursor: string | null };

type ItemResponse = {
  item: StoreItem;
  /** The caller's own stars, null when they have not rated it. */
  myRating: Stars | null;
  /** Whether the caller has installed it at least once, which rating requires. */
  installed: boolean;
};

type AuthorResponse = {
  author: Person & { avatarUrl: string | null; joinedAt: number; installs: number; ratingCount: number; ratingAverage: number | null };
  items: ItemCardView[];
};

type ItemCreateResponse = { item: StoreItem };

type MediaUploadResponse = { key: string; url: string; expiresInSeconds: number };

type VersionBeginResponse = { itemId: string; n: number; uploadId: string; partSize: number; parts: number };

type SignPartsResponse = { urls: { part: number; url: string }[] };

/** GET /items/:id/versions/:n/parts: the parts of an uploading version already in the bucket, for a resumed upload. */
type UploadedPartsResponse = { parts: { part: number; etag: string; size: number }[] };

type VersionCompleteResponse = { item: StoreItem };

type DownloadResponse = {
  url: string;
  expiresInSeconds: number;
  itemId: string;
  kind: StoreKind;
  name: string;
  version: number;
  semver: string;
  container: Container;
  bytes: number;
  sha256: string;
};

type RatingResponse = { stats: ItemStats; myRating: Stars | null };

type PublicationsResponse = { items: StoreItem[] };

type ReviewTarget = { kind: 'version'; n: number } | { kind: 'listing'; editId: string };

type ReviewEntry = {
  item: StoreItem;
  target: ReviewTarget;
  /** When it was sent for review; for a version not sent yet, when its upload started. */
  submittedAt: number;
  /** For a version: a short-lived link to the upload under incoming/, so the reviewer can test it. */
  downloadUrl?: string;
};

type ReviewQueueResponse = { entries: ReviewEntry[] };

/** GET /review/unsubmitted: the ready versions no author has sent for review yet, oldest first. */
type UnsubmittedResponse = { entries: ReviewEntry[] };

type ReviewDecideRequest = { decision: ReviewDecision; note: string };

/**
 * An inline signed link to a version's pack, read in parts. GET /review/:itemId/:target/pack
 * answers it for the review page, GET /items/:id/pack for the live version on the item page.
 */
type PackLinkResponse = {
  url: string;
  bytes: number;
  container: Container;
  /** When the link stops working, epoch ms. */
  expiresAt: number;
};

/**
 * The item after a change to it: a listing edit, an abort, a submit, a withdraw, a delete, a
 * review decision, an unlist or a relist. Projected like ItemResponse.item.
 */
type ItemChangeResponse = { item: StoreItem };

/** PUT /home/featured: the featured row as stored, first to last. */
type FeaturedResponse = { itemIds: string[] };

/** PUT /home/welcome */
type WelcomeResponse = HomeSettings;

/** POST /users/:userId/ban: how many of their items were unlisted. */
type BanResponse = { userId: string; unlisted: number };

type VersionRef = { itemId: string; n: number };

/** POST /jobs/daily */
type DailyJobResponse = {
  /** Items whose installs30d changed. */
  recounted: number;
  /** Per-day counters dropped for falling out of the window. */
  prunedDays: number;
  /** Versions whose upload was started and never finished, now deleted. */
  droppedUploads: VersionRef[];
  /** Rejected and ready versions whose file was kept its full time and is now removed. */
  expiredFiles: VersionRef[];
  /** Versions waiting so long their upload will soon leave incoming/. */
  staleWaiting: VersionRef[];
};

export type {
  HomeResponse,
  ItemsListResponse,
  ItemResponse,
  AuthorResponse,
  ItemCreateResponse,
  MediaUploadResponse,
  VersionBeginResponse,
  SignPartsResponse,
  UploadedPartsResponse,
  VersionCompleteResponse,
  DownloadResponse,
  RatingResponse,
  PublicationsResponse,
  ReviewTarget,
  ReviewEntry,
  ReviewQueueResponse,
  UnsubmittedResponse,
  ReviewDecideRequest,
  PackLinkResponse,
  ItemChangeResponse,
  FeaturedResponse,
  WelcomeResponse,
  BanResponse,
  VersionRef,
  DailyJobResponse,
};

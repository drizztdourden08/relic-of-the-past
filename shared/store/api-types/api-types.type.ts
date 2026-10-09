/* @layer shared-store @kind types */
import type { Container, ItemStats, Person, StoreItem, StoreKind } from '../types';
import type { HomeSettings, HomeView, ItemCardView } from '../home-types';
import type { Stars } from '../rating-types';
import type { ReviewDecision } from '../review-types';

type HomeResponse = HomeView;

type ItemsListResponse = { items: ItemCardView[]; nextCursor: string | null };

type ItemResponse = {
  item: StoreItem;
  myRating: Stars | null;
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

type UploadedPartsResponse = { parts: { part: number; etag: string; size: number }[] };

type VersionCompleteResponse = { item: StoreItem };

type DownloadResponse = {
  url: string;
  expiresInSeconds: number;
  itemId: string;
  kind: StoreKind;
  name: string;
  author: Person;
  license: string;
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
  submittedAt: number;
  downloadUrl?: string;
};

type ReviewQueueResponse = { entries: ReviewEntry[] };

type UnsubmittedResponse = { entries: ReviewEntry[] };

type ReviewDecideRequest = { decision: ReviewDecision; note: string };

type PackLinkResponse = {
  url: string;
  bytes: number;
  container: Container;
  expiresAt: number;
};

type ItemChangeResponse = { item: StoreItem };

type FeaturedResponse = { itemIds: string[] };

type WelcomeResponse = HomeSettings;

type BanResponse = { userId: string; unlisted: number };

type VersionRef = { itemId: string; n: number };

type DailyJobResponse = {
  recounted: number;
  prunedDays: number;
  droppedUploads: VersionRef[];
  expiredFiles: VersionRef[];
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

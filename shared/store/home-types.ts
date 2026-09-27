/* @layer shared-store @kind types */
/**
 * The home page: a welcome message the feature permission edits, then the featured row and
 * three shelves built from the catalogue.
 */
import type { MediaRef, Person, StoreKind } from './types';

/** One document; the welcome is markdown. */
type HomeSettings = { welcome: string; updatedBy: Person; updatedAt: number };

/** What a card on a shelf needs, and nothing a player may not see. */
type ItemCardView = {
  id: string;
  kind: StoreKind;
  slug: string;
  name: string;
  summary: string;
  author: Person;
  card: MediaRef | null;
  /** Shown only in the featured row. */
  banner: MediaRef | null;
  /** The live version's semver; null before the first approval. */
  semver: string | null;
  /** Plain average; null with no ratings. */
  ratingAverage: number | null;
  ratingCount: number;
  installs30d: number;
};

type HomeView = {
  welcome: string;
  featured: ItemCardView[];
  popular: ItemCardView[];
  topRated: ItemCardView[];
  fresh: ItemCardView[];
};

export type { HomeSettings, ItemCardView, HomeView };

/* @layer shared-store @kind types */
import type { MediaRef, Person, StoreKind } from '../types';

type HomeSettings = { welcome: string; updatedBy: Person; updatedAt: number };

type ItemCardView = {
  id: string;
  kind: StoreKind;
  slug: string;
  name: string;
  summary: string;
  author: Person;
  color: string;
  card: MediaRef | null;
  banner: MediaRef | null;
  semver: string | null;
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

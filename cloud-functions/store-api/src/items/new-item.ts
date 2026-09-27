/* @layer store-api @kind logic */
/** A new draft listing and the slug its keys are named with. The slug follows the name
 *  while the item is a draft and stays fixed once it is published. */
import type { ItemCreateBody } from '../../../../shared/store/schemas';
import type { ItemStats, Person, StoreItem } from '../../../../shared/store/types';

const MAX_SLUG_CHARS = 48;

const EMPTY_STATS: ItemStats = {
  installs: 0,
  installs30d: 0,
  ratingCount: 0,
  ratingSum: 0,
  ratingHist: [0, 0, 0, 0, 0],
  score: 0,
};

/** Lowercase ASCII words joined by dashes; falls back to `pack` when nothing is left. */
const slugOf = (name: string): string => {
  const slug = name
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, MAX_SLUG_CHARS)
    .replace(/-+$/g, '');
  return slug || 'pack';
};

const newItem = (id: string, body: ItemCreateBody, author: Person, at: number): StoreItem => ({
  id,
  kind: body.kind,
  slug: slugOf(body.name),
  author,
  name: body.name,
  summary: body.summary,
  description: body.description,
  tags: body.tags,
  license: body.license,
  card: null,
  banner: null,
  status: 'draft',
  versions: [],
  liveVersion: null,
  listingEdits: [],
  featured: null,
  stats: EMPTY_STATS,
  createdAt: at,
  publishedAt: null,
  updatedAt: at,
});

export { newItem, slugOf, EMPTY_STATS };

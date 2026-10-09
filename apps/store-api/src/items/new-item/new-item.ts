/* @layer store-api @kind logic */
import type { ItemCreateBody, Person, StoreItem } from '@rotp/hub-contracts';
import { EMPTY_STATS } from './new-item.constants';
import { slugOf } from './slug-of';

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
  color: body.color,
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

export { newItem };

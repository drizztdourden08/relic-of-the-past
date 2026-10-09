/* @layer hub-core @kind logic */
import { FALLBACK_SLUG, MAX_SLUG_CHARS } from './group-slug.constants';

const slugOf = (name: string): string =>
  name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, MAX_SLUG_CHARS)
    .replace(/-+$/g, '') || FALLBACK_SLUG;

export { slugOf };

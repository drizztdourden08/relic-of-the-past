/* @layer store-api @kind logic */
import { MAX_SLUG_CHARS } from './slug-of.constants';

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

export { slugOf };

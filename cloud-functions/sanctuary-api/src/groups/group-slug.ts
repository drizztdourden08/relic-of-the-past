/* @layer root-config @kind logic */
/** A group's id, made from its name: lowercase letters, digits and dashes. A
 *  taken id gets -2, -3 and so on until one is free. */
const MAX_SLUG_CHARS = 40;
const FALLBACK = 'group';

const slugOf = (name: string): string =>
  name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, MAX_SLUG_CHARS)
    .replace(/-+$/g, '') || FALLBACK;

const uniqueSlug = (name: string, taken: string[]): string => {
  const base = slugOf(name);
  if (!taken.includes(base)) return base;
  let suffix = 2;
  while (taken.includes(`${base}-${suffix}`)) suffix += 1;
  return `${base}-${suffix}`;
};

export { slugOf, uniqueSlug };

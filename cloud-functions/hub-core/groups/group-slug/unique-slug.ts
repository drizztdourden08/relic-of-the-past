/* @layer hub-core @kind logic */
import { slugOf } from './slug-of';

const uniqueSlug = (name: string, taken: string[]): string => {
  const base = slugOf(name);
  if (!taken.includes(base)) return base;
  let suffix = 2;
  while (taken.includes(`${base}-${suffix}`)) suffix += 1;
  return `${base}-${suffix}`;
};

export { uniqueSlug };

/* @layer shared-storage @kind logic */
import { FALLBACK_PACK_NAME } from './install-msul-pack.constants';
import { sanitizePackName } from './sanitize-pack-name';

const uniquePackName = (wanted: string, existing: string[]): string => {
  const base = sanitizePackName(wanted) || FALLBACK_PACK_NAME;
  if (!existing.includes(base)) return base;
  for (let n = 2; n < 1000; n += 1) {
    const candidate = `${base} (${n})`;
    if (!existing.includes(candidate)) return candidate;
  }
  return `${base} ${Date.now()}`;
};

export { uniquePackName };

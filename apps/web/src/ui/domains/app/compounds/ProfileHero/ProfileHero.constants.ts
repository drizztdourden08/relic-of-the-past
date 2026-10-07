/* @layer renderer-components @kind data */
/**
 * Hero art contract. Files live in apps/web/src/assets/home-hero/ as hero-art-<mode>.png:
 * a 128x128 pixel-art piece on a transparent ground, drawn at a whole pixel scale. A mode
 * without its piece shows the backdrop alone.
 */
import type { ProfileModeId } from '../ModeBadge';

// path → bundled url
const HERO_FILES = import.meta.glob('../../../../../assets/home-hero/hero-art-*.png', {
  eager: true,
  import: 'default',
}) as Record<string, string>;

const heroArtSrc = (mode: ProfileModeId): string | null => {
  const suffix = `/hero-art-${mode}.png`;
  for (const [path, url] of Object.entries(HERO_FILES)) {
    if (path.endsWith(suffix)) return url;
  }
  return null;
};

export { heroArtSrc };

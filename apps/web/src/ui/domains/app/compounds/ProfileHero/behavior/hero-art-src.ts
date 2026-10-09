/* @layer renderer-components @kind logic */
import type { ProfileModeId } from '../../ModeBadge';
import { HERO_FILES } from './hero-art-src.constants';

const heroArtSrc = (mode: ProfileModeId): string | null => {
  const suffix = `/hero-art-${mode}.png`;
  for (const [path, url] of Object.entries(HERO_FILES)) {
    if (path.endsWith(suffix)) return url;
  }
  return null;
};

export { heroArtSrc };

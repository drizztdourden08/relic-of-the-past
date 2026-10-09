/* @layer renderer-components @kind logic */
import type { ProfileModeId } from '../ModeBadge.type';
import { BADGE_FILES } from './mode-badge-src.constants';

const modeBadgeSrc = (mode: ProfileModeId): string | null => {
  const suffix = `/mode-${mode}.png`;
  for (const [path, url] of Object.entries(BADGE_FILES)) {
    if (path.endsWith(suffix)) return url;
  }
  return null;
};

export { modeBadgeSrc };

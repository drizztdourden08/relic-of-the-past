/* @layer renderer-components @kind data */
/**
 * Mode badge asset contract. Art lives in apps/web/src/assets/mode-badges/ as
 * mode-<id>.png — 128x128 transparent square (the source art trimmed, squared and
 * downscaled with a quality filter), rendered smoothly at --mode-badge-d. The glob resolves to an empty map
 * until the files exist, so dropping the PNGs in flips the badge from its
 * labeled fallback chip to the image with no code change.
 */
import type { ProfileModeId } from './ModeBadge.type';

// path → bundled url; {} while the art files are absent.
const BADGE_FILES = import.meta.glob('../../../../../assets/mode-badges/mode-*.png', {
  eager: true,
  import: 'default',
}) as Record<string, string>;

const modeBadgeSrc = (mode: ProfileModeId): string | null => {
  const suffix = `/mode-${mode}.png`;
  for (const [path, url] of Object.entries(BADGE_FILES)) {
    if (path.endsWith(suffix)) return url;
  }
  return null;
};

const MODE_BADGE_LABELS: Record<ProfileModeId, string> = {
  'vanilla': 'Vanilla',
  'vanilla-safe': 'Vanilla Safe',
  'randomizer': 'Randomizer',
  'randomizer-online': 'Online Randomizer',
};

/** Short monogram shown on the fallback chip until the art exists. */
const MODE_BADGE_MONOGRAMS: Record<ProfileModeId, string> = {
  'vanilla': 'V',
  'vanilla-safe': 'VS',
  'randomizer': 'R',
  'randomizer-online': 'RO',
};

export { MODE_BADGE_LABELS, MODE_BADGE_MONOGRAMS, modeBadgeSrc };

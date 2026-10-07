/* @layer electron-main @kind logic */
/**
 * Whether a version being offered reads the save states this build writes.
 *
 * The id travels in the ASSET FILENAME (`state-format-<id>.json`), so the release
 * listing the updater already fetches answers for every version at once. The file's
 * contents are for a human reading the release page.
 *
 * A version that publishes no such asset is UNVERIFIABLE, never "compatible":
 * guessing optimistically is how save states get lost without warning.
 */
import { BASELINE, compareTargetFormat } from '@shared/game/save-state';
import type { TargetCompat } from '@shared/game/save-state';
import { compareVersions } from './version-feed';

const STATE_FORMAT_PREFIX = 'state-format-';
const STATE_FORMAT_PATTERN = /^state-format-([0-9a-f]{6,})\.json$/;

interface AssetLike { name: string }

/** The id a release declares, or null when it declares none. */
const declaredFormatId = (assets: AssetLike[] | undefined): string | null => {
  const asset = assets?.find((a) => a.name.startsWith(STATE_FORMAT_PREFIX));
  if (!asset) return null;
  return asset.name.match(STATE_FORMAT_PATTERN)?.[1] ?? null;
};

/**
 * Releases from before the id was published are not unknown: every build then wrote
 * the baseline format. Without this every historical version would show a warning.
 */
const isPreBaseline = (version: string): boolean =>
  compareVersions(version, BASELINE.upToVersion) <= 0;

const targetCompatFor = (version: string, assets: AssetLike[] | undefined): TargetCompat => {
  const declared = declaredFormatId(assets);
  if (declared) return compareTargetFormat(declared);

  // An asset that is present but unparseable is a stronger signal than a missing one:
  // something published a format and we could not read it.
  const hasUnreadableAsset = assets?.some((a) => a.name.startsWith(STATE_FORMAT_PREFIX)) ?? false;
  if (hasUnreadableAsset) return { kind: 'unverifiable', why: 'unreachable' };

  if (isPreBaseline(version)) return compareTargetFormat(BASELINE.id);
  return { kind: 'unverifiable', why: 'not-published' };
};

export { declaredFormatId, STATE_FORMAT_PREFIX, targetCompatFor };
export type { AssetLike };

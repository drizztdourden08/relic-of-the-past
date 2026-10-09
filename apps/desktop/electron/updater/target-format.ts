/* @layer electron-main @kind logic */
import { BASELINE, compareTargetFormat } from '@shared/game/save-state';
import type { TargetCompat } from '@shared/game/save-state';
import { compareVersions } from './version-compare';
import { STATE_FORMAT_PATTERN, STATE_FORMAT_PREFIX } from './target-format.constants';
import type { AssetLike } from './target-format.type';

const declaredFormatId = (assets: AssetLike[] | undefined): string | null => {
  const asset = assets?.find((a) => a.name.startsWith(STATE_FORMAT_PREFIX));
  if (!asset) return null;
  return asset.name.match(STATE_FORMAT_PATTERN)?.[1] ?? null;
};

const isPreBaseline = (version: string): boolean =>
  compareVersions(version, BASELINE.upToVersion) <= 0;

const targetCompatFor = (version: string, assets: AssetLike[] | undefined): TargetCompat => {
  const declared = declaredFormatId(assets);
  if (declared) return compareTargetFormat(declared);

  const hasUnreadableAsset = assets?.some((a) => a.name.startsWith(STATE_FORMAT_PREFIX)) ?? false;
  if (hasUnreadableAsset) return { kind: 'unverifiable', why: 'unreachable' };

  if (isPreBaseline(version)) return compareTargetFormat(BASELINE.id);
  return { kind: 'unverifiable', why: 'not-published' };
};

export { targetCompatFor };
export type { AssetLike };

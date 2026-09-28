/* @layer store-api @kind logic */
/** The daily job. Recounts every item's installs over the last 30 days from the per-day
 *  counters and drops older counters. Ends versions whose upload was started and never
 *  finished, since the bucket cancels those uploads after two days: their rows stay as
 *  deleted. Removes the files of rejected and ready versions past their keep time. Reports
 *  versions that have waited so long the bucket will soon clear their upload from incoming/. */
import type { DailyJobResponse, VersionRef } from '../../../../shared/store/api-types';
import { STORE_LIMITS } from '../../../../shared/store/limits';
import type { StoreItem } from '../../../../shared/store/types';
import type { Actor } from '../../../../shared/store/version-flow';
import { now } from '../../../hub-core/db/firestore';
import { itemsRepo } from '../db/items-repo';
import { DAY_MS, dailyRepo } from '../db/daily-repo';
import { storeBucket } from '../storage/store-bucket';
import { moveVersion } from '../items/move-version';
import { versionOf } from '../items/versions';
import { expireFiles } from './expire-files';

/** An upload started this long ago and never completed is abandoned. */
const STALE_UPLOAD_MS = 2 * DAY_MS;
/** A waiting version is reported this many days before the bucket clears its upload. */
const WAITING_WARNING_DAYS = 7;
/** The job acts for the store, so it may take any step either role could. */
const JOB_ACTORS: readonly Actor[] = ['author', 'reviewer'];

const recount = async (items: StoreItem[], at: number): Promise<number> => {
  const counts = await dailyRepo.countsSince(dailyRepo.dayKey(at - (STORE_LIMITS.popularWindowDays - 1) * DAY_MS));
  const changed = items.filter((item) => item.stats.installs30d !== (counts.get(item.id) ?? 0));
  await Promise.all(changed.map((item) => itemsRepo.setInstalls30d(item.id, counts.get(item.id) ?? 0)));
  return changed.length;
};

const versionsWhere = (items: StoreItem[], test: (version: StoreItem['versions'][number]) => boolean): VersionRef[] =>
  items.flatMap((item) => item.versions.filter(test).map((version) => ({ itemId: item.id, n: version.n })));

const endUpload = async (item: StoreItem, n: number, at: number): Promise<void> => {
  const version = versionOf(item, n);
  if (version?.upload) await storeBucket.abort(version.key, version.upload.multipartId).catch(() => undefined);
  await itemsRepo.mutate(item.id, (latest) => (versionOf(latest, n)?.review.state === 'uploading'
    ? moveVersion(latest, {
      n,
      action: 'abort',
      actors: JOB_ACTORS,
      reshape: (entry, to) => ({ ...entry, upload: null, review: { ...entry.review, state: to }, removed: { at, reason: 'deleted', by: null } }),
    })
    : {}));
};

const runDaily = async (): Promise<DailyJobResponse> => {
  const at = now();
  const items = await itemsRepo.all();
  const recounted = await recount(items, at);
  const prunedDays = await dailyRepo.pruneBefore(dailyRepo.dayKey(at - STORE_LIMITS.popularWindowDays * DAY_MS));

  const droppedUploads = versionsWhere(items, (v) => v.review.state === 'uploading' && at - v.createdAt > STALE_UPLOAD_MS);
  for (const { itemId, n } of droppedUploads) {
    const item = items.find((entry) => entry.id === itemId);
    if (item) await endUpload(item, n, at);
  }

  const expiredFiles = await expireFiles(items, at);

  const warnAfter = (STORE_LIMITS.incomingKeepDays - WAITING_WARNING_DAYS) * DAY_MS;
  const staleWaiting = versionsWhere(items, (v) => v.review.state === 'waiting' && at - (v.review.submittedAt ?? v.createdAt) > warnAfter);
  if (staleWaiting.length > 0) console.warn('store: versions waiting close to the incoming/ lifecycle', staleWaiting);
  return { recounted, prunedDays, droppedUploads, expiredFiles, staleWaiting };
};

export { runDaily };

/* @layer store-api @kind logic */
/** A review entry on its way out: the item's pictures signed, and for a version a
 *  short-lived link to its upload under incoming/, so the reviewer can test it. The review
 *  routes are the one place such a link is signed. */
import type { ReviewEntry } from '../../../../shared/store/api-types';
import { versionOf } from '../items/versions';
import { signItem } from '../media/sign-media';
import { storeBucket } from '../storage/store-bucket';

const withLinks = async (entry: ReviewEntry): Promise<ReviewEntry> => {
  const item = await signItem(entry.item);
  const version = entry.target.kind === 'version' ? versionOf(entry.item, entry.target.n) : null;
  if (!version) return { ...entry, item };
  return { ...entry, item, downloadUrl: await storeBucket.signDownload(version.key, version.name) };
};

export { withLinks };

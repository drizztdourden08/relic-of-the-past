/* @layer store-api @kind logic */
import type { ReviewEntry } from '@rotp/hub-contracts';
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

/* @layer store-site @kind logic */
import type { ReviewEntry } from '@rotp/hub-contracts';

const versionOfEntry = (entry: ReviewEntry) => {
  const { item, target } = entry;
  return target.kind === 'version' ? item.versions.find((v) => v.n === target.n) ?? null : null;
};

export { versionOfEntry };

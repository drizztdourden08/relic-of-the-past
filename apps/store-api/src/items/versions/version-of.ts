/* @layer store-api @kind logic */
import type { StoreVersion } from '@rotp/hub-contracts';
import type { VersionList } from './versions.type';

const versionOf = (item: VersionList, n: number): StoreVersion | null =>
  item.versions.find((version) => version.n === n) ?? null;

export { versionOf };

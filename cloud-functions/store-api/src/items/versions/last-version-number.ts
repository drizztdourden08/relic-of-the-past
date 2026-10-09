/* @layer store-api @kind logic */
import type { VersionList } from './versions.type';

const lastVersionNumber = (item: VersionList): number => Math.max(0, ...item.versions.map((version) => version.n));

export { lastVersionNumber };

/* @layer root-config @kind logic */
import type { FileVersion, SanctuaryFile } from '@rotp/hub-contracts';
import { versionOf } from './version-of';

const currentVersionOf = (file: SanctuaryFile): FileVersion =>
  versionOf(file, file.currentVersion) ?? file.versions[file.versions.length - 1];

export { currentVersionOf };

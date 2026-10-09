/* @layer root-config @kind logic */
import type { FileVersion, SanctuaryFile } from '@rotp/hub-contracts';

const versionOf = (file: SanctuaryFile, n: number): FileVersion | null =>
  file.versions.find((version) => version.n === n) ?? null;

export { versionOf };

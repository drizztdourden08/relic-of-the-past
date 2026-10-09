/* @layer sanctuary-site @kind logic */
import type { FileVersion } from '@shared/sanctuary/file-types';
import type { Versioned } from './file-versions.type';

const versionByNumber = (file: Versioned, n: number): FileVersion | null =>
  file.versions.find((version) => version.n === n) ?? null;

const currentVersionOf = (file: Versioned): FileVersion | null => versionByNumber(file, file.currentVersion);

export { currentVersionOf };

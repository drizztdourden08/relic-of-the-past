/* @layer sanctuary-site @kind logic */
/**
 * Reading a file's version history. Versions are never renumbered, and a deleted one
 * leaves a gap, so a version is found by its number, never by its index, and the next
 * number follows the highest one ever given.
 */
import type { FileVersion, SanctuaryFile } from '@shared/sanctuary/file-types';

type Versioned = Pick<SanctuaryFile, 'versions' | 'currentVersion'>;

const versionByNumber = (file: Versioned, n: number): FileVersion | null =>
  file.versions.find((version) => version.n === n) ?? null;

const currentVersionOf = (file: Versioned): FileVersion | null => versionByNumber(file, file.currentVersion);

/** The number the API gives the next upload of this file. */
const nextVersionNumber = (file: Versioned): number =>
  file.versions.reduce((highest, version) => Math.max(highest, version.n), 0) + 1;

/** The finished versions, newest first, as the history lists them. */
const versionsNewestFirst = (file: Versioned): FileVersion[] =>
  file.versions.filter((version) => version.status === 'ready').sort((a, b) => b.n - a.n);

const versionLabel = (n: number) => `v${n}`;

export { currentVersionOf, nextVersionNumber, versionsNewestFirst, versionLabel };
export type { Versioned };

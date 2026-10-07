/* @layer sanctuary-site @kind logic */
/**
 * A dropped file whose name matches a file the caller can see is offered as that file's
 * next version. Names compare without case, and without a trailing " (2)" the OS added
 * or a "-v3", "_v3" or " v3" the author added before the extension.
 */
import type { SanctuaryFile } from '@shared/sanctuary/file-types';
import { currentVersionOf } from '../../../files/file-versions';

const COPY_OR_VERSION_SUFFIX = /(\s*\(\d+\)|[-_ ]v\d+)(?=\.[^.]+$|$)/;

const stem = (name: string) => name.toLowerCase().replace(COPY_OR_VERSION_SUFFIX, '');

/** The display name and the current version's own name both count. */
const namesOf = (file: SanctuaryFile): string[] => {
  const current = currentVersionOf(file);
  return current ? [file.name, current.name] : [file.name];
};

/** The first file (newest first, as the list is kept) the dropped one could be a version of. */
const sameNameMatch = (dropped: File, files: readonly SanctuaryFile[]): SanctuaryFile | null => {
  const wanted = stem(dropped.name);
  return files.find((file) => namesOf(file).some((name) => stem(name) === wanted)) ?? null;
};

export { sameNameMatch, stem };

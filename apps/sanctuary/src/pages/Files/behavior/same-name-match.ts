/* @layer sanctuary-site @kind logic */
import type { SanctuaryFile } from '@shared/sanctuary/file-types';
import { currentVersionOf } from '../../../files/file-versions';
import { COPY_OR_VERSION_SUFFIX } from './same-name-match.constants';

const stem = (name: string) => name.toLowerCase().replace(COPY_OR_VERSION_SUFFIX, '');

const namesOf = (file: SanctuaryFile): string[] => {
  const current = currentVersionOf(file);
  return current ? [file.name, current.name] : [file.name];
};

const sameNameMatch = (dropped: File, files: readonly SanctuaryFile[]): SanctuaryFile | null => {
  const wanted = stem(dropped.name);
  return files.find((file) => namesOf(file).some((name) => stem(name) === wanted)) ?? null;
};

export { sameNameMatch };

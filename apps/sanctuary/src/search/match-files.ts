/* @layer sanctuary-site @kind logic */
import { FILE_TYPES, FILE_TYPE_LABELS } from '@shared/sanctuary/file-types';
import type { SanctuaryFile } from '@shared/sanctuary/file-types';
import type { FileMatchGroup } from './match-files.type';

const searchableText = (file: SanctuaryFile): (string | null)[] => [
  file.name,
  file.note,
  ...file.tags,
  file.version,
  file.owner.displayName,
  FILE_TYPE_LABELS[file.type],
];

const fileMatches = (file: SanctuaryFile, query: string): boolean =>
  searchableText(file).some((text) => text !== null && text.toLowerCase().includes(query));

const matchFiles = (files: readonly SanctuaryFile[], query: string): FileMatchGroup[] =>
  FILE_TYPES.flatMap((type) => {
    const hits = files.filter((file) => file.type === type && fileMatches(file, query));
    return hits.length > 0 ? [{ type, files: hits }] : [];
  });

export { matchFiles };

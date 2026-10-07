/* @layer sanctuary-site @kind logic */
/**
 * Which files a global search finds, grouped by type in type order. A file matches when
 * the (lowercase) query appears in its name, note, a tag, its version, its owner's name
 * or its type's label. The results draw exactly these files, so a count is its rows.
 */
import { FILE_TYPES, FILE_TYPE_LABELS } from '@shared/sanctuary/file-types';
import type { FileType, SanctuaryFile } from '@shared/sanctuary/file-types';

type FileMatchGroup = { type: FileType; files: SanctuaryFile[] };

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

export { matchFiles, fileMatches };
export type { FileMatchGroup };

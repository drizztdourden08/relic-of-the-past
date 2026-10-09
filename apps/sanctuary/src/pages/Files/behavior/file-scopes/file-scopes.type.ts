/* @layer sanctuary-site @kind types */
import type { SanctuaryFile } from '@shared/sanctuary/file-types';

type FileLike = Pick<SanctuaryFile, 'type' | 'owner'>;

type FilePredicate = (file: FileLike) => boolean;

export type { FileLike, FilePredicate };

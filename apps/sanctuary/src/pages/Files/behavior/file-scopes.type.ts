/* @layer sanctuary-site @kind types */
import type { SanctuaryFile } from '@rotp/hub-contracts';

type FileLike = Pick<SanctuaryFile, 'type' | 'owner'>;

type FilePredicate = (file: FileLike) => boolean;

export type { FileLike, FilePredicate };

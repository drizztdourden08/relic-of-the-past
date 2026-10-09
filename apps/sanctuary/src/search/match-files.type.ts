/* @layer sanctuary-site @kind types */
import type { FileType, SanctuaryFile } from '@shared/sanctuary/file-types';

type FileMatchGroup = { type: FileType; files: SanctuaryFile[] };

export type { FileMatchGroup };

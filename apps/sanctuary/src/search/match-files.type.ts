/* @layer sanctuary-site @kind types */
import type { FileType, SanctuaryFile } from '@rotp/hub-contracts';

type FileMatchGroup = { type: FileType; files: SanctuaryFile[] };

export type { FileMatchGroup };

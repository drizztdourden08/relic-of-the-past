/* @layer sanctuary-site @kind types */
import type { SanctuaryFile } from '@shared/sanctuary/file-types';

type FileRow = Pick<SanctuaryFile, 'id' | 'name' | 'type' | 'tags' | 'version' | 'owner' | 'bytes' | 'note' | 'stats'> & {
  rev: string;
  size: string;
  createdAt: string;
  expiresAt: string | null;
};

export type { FileRow };

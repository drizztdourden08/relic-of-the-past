/* @layer sanctuary-site @kind types */
import type { SanctuaryFile } from '@rotp/hub-contracts';

type FileRow = Pick<SanctuaryFile, 'id' | 'name' | 'type' | 'tags' | 'version' | 'owner' | 'bytes' | 'note' | 'stats'> & {
  rev: string;
  size: string;
  createdAt: string;
  expiresAt: string | null;
};

export type { FileRow };

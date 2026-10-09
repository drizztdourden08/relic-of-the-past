/* @layer root-config @kind types */
import type { SanctuaryFile } from '@rotp/hub-contracts';

type FilePage = { items: SanctuaryFile[]; nextCursor: string | null };
type FilePatch = Partial<Omit<SanctuaryFile, 'id' | 'owner' | 'stats' | 'createdAt'>>;
type FileChange = (file: SanctuaryFile) => FilePatch;

export type { FilePage, FilePatch, FileChange };

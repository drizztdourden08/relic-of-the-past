/* @layer sanctuary-site @kind types */
import type { SanctuaryFile } from '@shared/sanctuary/file-types';

type SkipNoteProps = {
  skipped: readonly SanctuaryFile[];
  total: number;
};

export type { SkipNoteProps };

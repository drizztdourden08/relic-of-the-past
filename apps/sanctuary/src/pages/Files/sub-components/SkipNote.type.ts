/* @layer sanctuary-site @kind types */
import type { SanctuaryFile } from '@rotp/hub-contracts';

type SkipNoteProps = {
  skipped: readonly SanctuaryFile[];
  total: number;
};

export type { SkipNoteProps };

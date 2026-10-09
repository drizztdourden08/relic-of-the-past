/* @layer sanctuary-site @kind logic */
import type { SanctuaryFile } from '@rotp/hub-contracts';
import type { RightSplit } from './batch-edits.type';

const splitByRight = (files: readonly SanctuaryFile[], canEdit: (file: SanctuaryFile) => boolean): RightSplit => ({
  mine: files.filter(canEdit),
  others: files.filter((file) => !canEdit(file)),
});

export { splitByRight };

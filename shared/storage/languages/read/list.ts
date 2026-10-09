/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import type { LanguageSetSummary } from '../types';
import { summaryOf } from './summary-of';

const list = async (files: FileStore): Promise<LanguageSetSummary[]> => {
  const out: LanguageSetSummary[] = [];
  for (const id of await files.list('languages')) {
    const summary = await summaryOf(files, id);
    if (summary) out.push(summary);
  }
  return out;
};

export { list };

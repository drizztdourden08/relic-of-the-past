/* @layer shared-asset-extraction @kind logic */
import type { PatchedPart, PatchedPartId, PatchedPartReport, PatchedWork } from './patched-language.type';

const runPart = (part: PatchedPartId, run: PatchedPart, work: PatchedWork): PatchedPartReport => {
  try {
    return run(work);
  } catch (err) {
    return { part, status: 'failed', detail: err instanceof Error ? err.message : String(err) };
  }
};

export { runPart };

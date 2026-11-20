/* @layer shared-asset-extraction @kind logic */
import type { Text } from '@drizztdourden08/brock-core/i18n';
import { RomLoadError } from '../../rom/rom-loader/rom-load-error';
import type { PatchedPart, PatchedPartId, PatchedPartReport, PatchedWork } from './patched-language.type';

const detailOf = (err: unknown): Text => {
  if (err instanceof RomLoadError) return err.text;
  return err instanceof Error ? err.message : String(err);
};

const runPart = (part: PatchedPartId, run: PatchedPart, work: PatchedWork): PatchedPartReport => {
  try {
    return run(work);
  } catch (err) {
    return { part, status: 'failed', detail: detailOf(err) };
  }
};

export { runPart };

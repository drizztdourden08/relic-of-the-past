/* @layer shared-asset-extraction @kind logic */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { DecodedLine } from '../../menu-text/menu-text.type';
import type { PatchedPartReport, PatchedWork } from '../patched-language.type';
import { changedLines } from './changed-lines';
import type { ScreenTextRead } from './parts.type';

const baseLines = (read: ScreenTextRead, work: PatchedWork): DecodedLine[] | null => {
  if (!work.baseRom) return null;
  try {
    return read.decode(work.baseRom, work.base);
  } catch {
    return null;
  }
};

const screenTextPart = (read: ScreenTextRead, work: PatchedWork): PatchedPartReport => {
  const lines = read.decode(work.patched, work.base);
  const before = baseLines(read, work);
  const changed = changedLines(lines, before);
  read.keep(work, changed);
  const count = Object.keys(changed).length;
  if (before === null) return { part: read.part, status: 'ok', detail: msg('rom-loader:patched.screenText.read', { count }) };
  return { part: read.part, status: 'ok', detail: msg('rom-loader:patched.screenText.differ', { count, total: lines.length }) };
};

export { screenTextPart };

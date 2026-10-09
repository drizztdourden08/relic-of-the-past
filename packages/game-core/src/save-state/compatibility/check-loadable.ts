/* @layer shared-game @kind logic */
import { CURRENT_STATE_FORMAT } from '../current-format.constants';
import { readSnapshotBytes, readStamp } from '../state-file';
import type { Loadability } from '../save-state.type';

const checkLoadable = (buffer: ArrayBuffer): Loadability => {
  if (readSnapshotBytes(buffer) === null) {
    return { ok: false, stamp: null, reason: 'not-a-state', message: 'This file is not a save state.' };
  }

  const stamp = readStamp(buffer);
  if (!stamp) {
    return {
      ok: false,
      stamp: null,
      reason: 'format-mismatch',
      message: 'This save state was made by a version that used a different save state format.',
    };
  }

  if (stamp.formatId === CURRENT_STATE_FORMAT.id) return { ok: true, stamp };

  return {
    ok: false,
    stamp,
    reason: 'format-mismatch',
    message: `This save state was made in ${stamp.app}, which used a different save state format.`,
  };
};

export { checkLoadable };

/* @layer shared-game @kind logic */
/**
 * The two compatibility questions, kept apart because they are answered differently.
 *
 * A file on disk can be inspected directly. A version being offered cannot. The running
 * build can only compare against what that version published about itself, which is why
 * 'unverifiable' exists and never collapses into 'compatible'.
 */
import { CURRENT_STATE_FORMAT } from './current-format.generated';
import { formatById } from './formats';
import { readSnapshotBytes, readStamp } from './state-file';
import type { Loadability, StateStamp, TargetCompat } from './types';

/**
 * Whether this build can load a save state file.
 *
 * An unstamped file predates the stamp, so its format is the baseline one by definition.
 * No build that could have written it produced anything else. Falling back to the
 * snapshot total keeps that judgement honest without inventing a stamp for it.
 */
const checkLoadable = (buffer: ArrayBuffer): Loadability => {
  const snapshotBytes = readSnapshotBytes(buffer);
  if (snapshotBytes === null) {
    return { ok: false, stamp: null, reason: 'not-a-state', message: 'This file is not a save state.' };
  }

  const stamp = readStamp(buffer);
  if (!stamp) {
    return snapshotBytes === CURRENT_STATE_FORMAT.totalBytes
      ? { ok: true, stamp: null }
      : {
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

/** Compare a published id against this build's. Callers supply the id; fetching is theirs. */
const compareTargetFormat = (targetId: string): TargetCompat =>
  targetId === CURRENT_STATE_FORMAT.id ? { kind: 'compatible' } : { kind: 'incompatible', targetId };

/**
 * What the dialog says. The reinstall line is the point of the whole message and holds in
 * both cases: an update replaces the installed application, while save states live in the
 * user data directory and are never touched by one.
 */
const describeTargetCompat = (compat: TargetCompat, currentVersion: string): string | null => {
  if (compat.kind === 'compatible') return null;
  const goBack = `Nothing is deleted either way. Reinstalling ${currentVersion} always gets them back.`;

  if (compat.kind === 'incompatible') {
    return `This version uses a different save state format, so your existing save states will not load. ${goBack} Your in-game saves are not affected.`;
  }
  return `This version did not publish its save state format, so there is a chance your save states will not load. ${goBack}`;
};

/** The version a stamped save was made in, for anywhere that lists saves. */
const describeStamp = (stamp: StateStamp | null): string | null => {
  if (!stamp) return null;
  const known = formatById(stamp.formatId);
  return known ? `${stamp.app} (format ${stamp.formatId})` : `${stamp.app} (unrecognised format)`;
};

export { checkLoadable, compareTargetFormat, describeStamp, describeTargetCompat };

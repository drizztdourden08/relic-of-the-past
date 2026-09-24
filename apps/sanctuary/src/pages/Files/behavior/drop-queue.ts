/* @layer sanctuary-site @kind logic */
/**
 * Where the dropped files of the Files page stand, one step at a time. Files are taken
 * in drop order: one with no match joins the batch for the usual upload dialog, one
 * that matches an existing file stops the walk and asks. Once the queue is empty, the
 * batch goes to the upload dialog. A version upload in progress (from the question, or
 * from the drop zone of a file's history) holds the walk until it is confirmed or dropped.
 */
import type { SanctuaryFile } from '@shared/sanctuary/file-types';

type VersionRequest = { file: SanctuaryFile; dropped: File };

type SameNameQuestion = { dropped: File; match: SanctuaryFile };

type DropQueue = {
  /** Still to look at, in drop order. */
  queue: File[];
  /** Seen, no match or kept separate; they go to the upload dialog together. */
  batch: File[];
  /** The file being asked about. */
  asking: SameNameQuestion | null;
  /** The version dialog's file and the dropped bytes. */
  version: VersionRequest | null;
  /** What the upload dialog shows; empty while it is closed. */
  upload: File[];
};

type MatchOf = (dropped: File) => SanctuaryFile | null;

const EMPTY_QUEUE: DropQueue = { queue: [], batch: [], asking: null, version: null, upload: [] };

/** Walks the queue until a question or the end; at the end the batch opens the upload dialog. */
const settle = (state: DropQueue, matchOf: MatchOf): DropQueue => {
  if (state.asking || state.version) return state;
  const batch = [...state.batch];
  for (let i = 0; i < state.queue.length; i += 1) {
    const dropped = state.queue[i];
    const match = matchOf(dropped);
    if (match) return { ...state, queue: state.queue.slice(i + 1), batch, asking: { dropped, match } };
    batch.push(dropped);
  }
  return { ...state, queue: [], batch: [], upload: [...state.upload, ...batch] };
};

const dropFiles = (state: DropQueue, files: File[], matchOf: MatchOf): DropQueue =>
  settle({ ...state, queue: [...state.queue, ...files] }, matchOf);

const keepSeparate = (state: DropQueue, matchOf: MatchOf): DropQueue =>
  (state.asking ? settle({ ...state, batch: [...state.batch, state.asking.dropped], asking: null }, matchOf) : state);

const asVersion = (state: DropQueue): DropQueue =>
  (state.asking ? { ...state, asking: null, version: { file: state.asking.match, dropped: state.asking.dropped } } : state);

/** Closing the question leaves that one file out. */
const skipAsked = (state: DropQueue, matchOf: MatchOf): DropQueue => settle({ ...state, asking: null }, matchOf);

const requestVersion = (state: DropQueue, request: VersionRequest): DropQueue => ({ ...state, version: request });

const versionDone = (state: DropQueue, matchOf: MatchOf): DropQueue => settle({ ...state, version: null }, matchOf);

const uploadDone = (state: DropQueue): DropQueue => ({ ...state, upload: [] });

export { EMPTY_QUEUE, dropFiles, keepSeparate, asVersion, skipAsked, requestVersion, versionDone, uploadDone };
export type { DropQueue, VersionRequest, SameNameQuestion, MatchOf };

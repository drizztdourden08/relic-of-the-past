/* @layer sanctuary-site @kind hook */
/**
 * The dialogs a drop leads to on the Files page: the same-name question, the new version
 * dialog and the usual upload dialog, walked one dropped file at a time (drop-queue.ts).
 * Confirming a dialog starts the upload; the rest of the queue carries on after it.
 */
import { useCallback, useMemo, useState } from 'react';
import type { SanctuaryFile } from '@shared/sanctuary/file-types';
import { nextVersionNumber } from '../../../files/file-versions';
import type { UploadMeta, UploadTarget } from '../../../upload/upload-job.type';
import { sameNameMatch } from './same-name-match';
import {
  EMPTY_QUEUE,
  asVersion,
  dropFiles,
  keepSeparate,
  requestVersion,
  skipAsked,
  uploadDone,
  versionDone,
} from './drop-queue';

type UseDropFlowParams = {
  /** The files the caller sees; a dropped file is matched against these. */
  files: readonly SanctuaryFile[];
  start: (files: File[], target: UploadTarget) => void;
};

const useDropFlow = (params: UseDropFlowParams) => {
  const { files, start } = params;
  const [state, setState] = useState(EMPTY_QUEUE);
  const matchOf = useCallback((dropped: File) => sameNameMatch(dropped, files), [files]);

  const drop = useCallback((dropped: File[]) => setState((s) => dropFiles(s, dropped, matchOf)), [matchOf]);
  const separate = useCallback(() => setState((s) => keepSeparate(s, matchOf)), [matchOf]);
  const version = useCallback(() => setState(asVersion), []);
  const skip = useCallback(() => setState((s) => skipAsked(s, matchOf)), [matchOf]);

  /** A file dropped on one file's history: straight to the version dialog. */
  const dropOnFile = useCallback((file: SanctuaryFile, dropped: File) => {
    setState((s) => requestVersion(s, { file, dropped }));
  }, []);

  const { version: request, upload } = state;

  const confirmVersion = useCallback((note: string) => {
    if (request) {
      const { file, dropped } = request;
      start([dropped], { kind: 'version', fileId: file.id, note, of: file.name, next: nextVersionNumber(file) });
    }
    setState((s) => versionDone(s, matchOf));
  }, [request, start, matchOf]);
  const cancelVersion = useCallback(() => setState((s) => versionDone(s, matchOf)), [matchOf]);

  const confirmUpload = useCallback((meta: UploadMeta) => {
    start(upload, { kind: 'new', meta });
    setState(uploadDone);
  }, [upload, start]);
  const cancelUpload = useCallback(() => setState(uploadDone), []);

  return useMemo(() => ({
    asking: state.asking,
    request,
    upload,
    drop,
    dropOnFile,
    separate,
    version,
    skip,
    confirmVersion,
    cancelVersion,
    confirmUpload,
    cancelUpload,
  }), [state.asking, request, upload, drop, dropOnFile, separate, version, skip, confirmVersion, cancelVersion, confirmUpload, cancelUpload]);
};

type DropFlow = ReturnType<typeof useDropFlow>;

export { useDropFlow };
export type { DropFlow, UseDropFlowParams };

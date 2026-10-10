/* @layer sanctuary-site @kind hook */
import { useCallback, useMemo, useState } from 'react';
import type { SanctuaryFile } from '@rotp/hub-contracts';
import { nextVersionNumber } from '../../../files/file-versions';
import type { UploadMeta } from '../../../upload/upload-target.type';
import { sameNameMatch } from './same-name-match';
import { EMPTY_QUEUE } from './drop-queue.constants';
import { asVersion } from './as-version';
import { dropFiles } from './drop-files';
import { keepSeparate } from './keep-separate';
import { requestVersion } from './request-version';
import { skipAsked } from './skip-asked';
import { uploadDone } from './upload-done';
import { versionDone } from './version-done';
import type { UseDropFlowParams } from './useDropFlow.type';

const useDropFlow = (params: UseDropFlowParams) => {
  const { files, start } = params;
  const [state, setState] = useState(EMPTY_QUEUE);
  const matchOf = useCallback((dropped: File) => sameNameMatch(dropped, files), [files]);

  const drop = useCallback((dropped: File[]) => setState((s) => dropFiles(s, dropped, matchOf)), [matchOf]);
  const separate = useCallback(() => setState((s) => keepSeparate(s, matchOf)), [matchOf]);
  const version = useCallback(() => setState(asVersion), []);
  const skip = useCallback(() => setState((s) => skipAsked(s, matchOf)), [matchOf]);

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

export { useDropFlow };

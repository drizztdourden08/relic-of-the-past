/* @layer sanctuary-site @kind hook */
/**
 * What the detail pane can do to one file: download, copy its link, patch its fields,
 * delete it, and download, restore or delete one of its versions. Each call reports back through `notice`; a write hands the API's record to
 * the list, a delete drops the row and closes the pane.
 */
import { useCallback, useState } from 'react';
import type { SanctuaryFile } from '@shared/sanctuary/file-types';
import type { PatchFileBody } from '@shared/sanctuary/schemas/file-schemas';
import { deleteFile, downloadFile, patchFile } from '../../../api/files-endpoints';
import { deleteVersion, downloadVersion, restoreVersion } from '../../../api/versions-endpoints';
import { errorMessage } from '../../../api/client';
import { versionLabel } from '../../../files/file-versions';

type UseFileActionsParams = {
  onPatched: (file: SanctuaryFile) => void;
  onDeleted: (id: string) => void;
};

const COPIED_MS = 1500;

const fileLink = (id: string) => `${window.location.origin}/files/${id}`;

const useFileActions = (params: UseFileActionsParams) => {
  const { onPatched, onDeleted } = params;
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const run = useCallback(async (work: () => Promise<string | null>) => {
    setBusy(true);
    setNotice(null);
    try {
      setNotice(await work());
    } catch (cause) {
      setNotice(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }, []);

  const download = useCallback((id: string) => run(async () => {
    const { url } = await downloadFile(id);
    window.location.assign(url);
    return null;
  }), [run]);

  const copyLink = useCallback((id: string) => run(async () => {
    await navigator.clipboard.writeText(fileLink(id));
    setTimeout(() => setNotice(null), COPIED_MS);
    return 'Link copied.';
  }), [run]);

  const patch = useCallback((id: string, body: PatchFileBody) => run(async () => {
    const { file } = await patchFile(id, body);
    onPatched(file);
    return null;
  }), [run, onPatched]);

  const remove = useCallback((id: string) => run(async () => {
    await deleteFile(id);
    onDeleted(id);
    return null;
  }), [run, onDeleted]);

  const downloadOne = useCallback((id: string, n: number) => run(async () => {
    const { url } = await downloadVersion(id, n);
    window.location.assign(url);
    return null;
  }), [run]);

  const restore = useCallback((id: string, n: number) => run(async () => {
    const { file } = await restoreVersion(id, n);
    onPatched(file);
    return `${versionLabel(n)} is current again.`;
  }), [run, onPatched]);

  const removeOne = useCallback((id: string, n: number) => run(async () => {
    const { file } = await deleteVersion(id, n);
    onPatched(file);
    return `${versionLabel(n)} deleted.`;
  }), [run, onPatched]);

  return {
    busy,
    notice,
    download,
    copyLink,
    patch,
    remove,
    versions: { download: downloadOne, restore, remove: removeOne },
  };
};

type FileActions = ReturnType<typeof useFileActions>;

export { useFileActions, fileLink };
export type { FileActions, UseFileActionsParams };

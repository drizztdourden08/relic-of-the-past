/* @layer sanctuary-site @kind hook */
import { useCallback, useState } from 'react';
import type { PatchFileBody } from '@rotp/hub-contracts';
import { deleteFile, downloadFile, patchFile } from '../../../api/files-endpoints';
import { deleteVersion, downloadVersion, restoreVersion } from '../../../api/versions-endpoints';
import { errorMessage } from '@site-kit/api/api-error';
import { versionLabel } from '../../../files/file-versions';
import { fileLink } from './file-link';
import { COPIED_MS } from './useFileActions.constants';
import type { UseFileActionsParams } from './useFileActions.type';

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

export { useFileActions };

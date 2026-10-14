/* @layer renderer-components @kind hook */
import { useCallback, useMemo, useState } from 'react';
import { formatCounts } from './format-counts';
import { usePackMetadata } from './usePackMetadata';
import { useFileMutations } from './useFileMutations';
import { useSoundUpload } from './useSoundUpload';
import type { ActionResult } from '../msu.type';
import type { FilePanelParams } from './file-panel.type';

const useFilePanel = (params: FilePanelParams) => {
  const { pack, files, saveBase, reload } = params;
  const { metadata, settledPack } = usePackMetadata(pack, files);
  const [filter, setFilter] = useState('');
  const [working, setWorking] = useState(false);
  const [status, setStatus] = useState<ActionResult | null>(null);
  const { upload, uploading } = useSoundUpload({ pack, files, reload });

  const rows = useMemo(() => {
    const needle = filter.trim().toLowerCase().replace(/^\./, '');
    if (needle.length === 0) return metadata;
    return metadata.filter((file) => file.name.toLowerCase().includes(needle) || file.ext === needle);
  }, [metadata, filter]);

  const totalSize = useMemo(() => metadata.reduce((sum, file) => sum + file.size, 0), [metadata]);
  const formats = useMemo(() => formatCounts(metadata), [metadata]);
  const taken = useMemo(() => new Set(metadata.map((file) => file.name)), [metadata]);

  const { renameFile, deleteFile } = useFileMutations({ pack, saveBase, taken, reload, setStatus, setWorking });

  const handleUpload = useCallback((dropped: File[]) => {
    void upload(dropped).then(setStatus);
  }, [upload]);

  const report = useCallback((result: ActionResult) => { setStatus(result); }, []);

  return {
    metadata, rows, totalSize, formats,
    ready: settledPack === pack,
    filter, setFilter,
    renameFile, deleteFile, handleUpload, report,
    busy: working || uploading,
    statusMessage: status?.message ?? null,
    statusOk: status?.success !== false,
  };
};

export { useFilePanel };
export type { FilePanelParams, FormatCount } from './file-panel.type';

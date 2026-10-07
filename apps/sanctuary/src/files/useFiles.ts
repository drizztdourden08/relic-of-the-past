/* @layer sanctuary-site @kind hook */
/**
 * Every ready file, loaded once by the signed-in frame, then kept in step with what the
 * pages do to it: an upload adds a record, a patch replaces one, a delete drops one. No
 * reload after a write; the API's answer is the record.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { SanctuaryFile } from '@shared/sanctuary/file-types';
import { listFiles } from '../api/files-endpoints';
import { errorMessage } from '../api/client';

const NO_FILES: SanctuaryFile[] = [];

const byNewest = (a: SanctuaryFile, b: SanctuaryFile) => b.createdAt - a.createdAt;

const useFiles = () => {
  const [files, setFiles] = useState<SanctuaryFile[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const { files: rows } = await listFiles();
      setFiles(rows.filter((file) => file.status === 'ready').sort(byNewest));
      setError(null);
    } catch (cause) {
      setError(errorMessage(cause));
      setFiles([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const upsert = useCallback((file: SanctuaryFile) => {
    setFiles((rows) => [file, ...(rows ?? []).filter((row) => row.id !== file.id)].sort(byNewest));
  }, []);

  const remove = useCallback((id: string) => {
    setFiles((rows) => (rows ?? []).filter((row) => row.id !== id));
  }, []);

  return useMemo(
    () => ({ files: files ?? NO_FILES, loading: files === null, error, reload: load, upsert, remove }),
    [files, error, load, upsert, remove],
  );
};

export { useFiles };

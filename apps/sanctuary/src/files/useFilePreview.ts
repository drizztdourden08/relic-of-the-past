/* @layer sanctuary-site @kind hook */
/**
 * The inline link of one file's current version. It is fetched again whenever the file
 * or its current version changes; an answer for an older pair is ignored.
 */
import { useEffect, useState } from 'react';
import { previewFile } from '../api/files-endpoints';
import { errorMessage } from '../api/client';

type PreviewResult = {
  /** The file and version the answer is for. */
  key: string;
  url: string | null;
  error: string | null;
};

const useFilePreview = (fileId: string, currentVersion: number) => {
  const key = `${fileId}:${currentVersion}`;
  const [result, setResult] = useState<PreviewResult | null>(null);

  useEffect(() => {
    let live = true;
    previewFile(fileId, currentVersion).then(
      ({ url }) => { if (live) setResult({ key, url, error: null }); },
      (cause: unknown) => { if (live) setResult({ key, url: null, error: errorMessage(cause) }); },
    );
    return () => { live = false; };
  }, [fileId, currentVersion, key]);

  const current = result?.key === key ? result : null;
  return { url: current?.url ?? null, error: current?.error ?? null, loading: current === null };
};

type FilePreview = ReturnType<typeof useFilePreview>;

export { useFilePreview };
export type { FilePreview };

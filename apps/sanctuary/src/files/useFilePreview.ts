/* @layer sanctuary-site @kind hook */
import { useEffect, useState } from 'react';
import { previewFile } from '../endpoints/files-endpoints';
import { errorMessage } from '@rotp/hub-client';
import type { PreviewResult } from './file-preview.type';

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

export { useFilePreview };

/* @layer store-site @kind hook */
/**
 * One picture field: the file the author picked, made into the store's webp at once, so
 * the preview shows exactly what will be sent and a picture that cannot fit is refused
 * before anything is submitted. The preview link is released when it is replaced.
 */
import { useCallback, useEffect, useState } from 'react';
import { errorMessage } from '@site-kit/api/api-error';
import { resizeToWebp } from '../../../lib/resize-image';
import type { Picture, PictureSpec } from '../../../lib/resize-image';

const usePicture = (spec: PictureSpec) => {
  const [picture, setPicture] = useState<Picture | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  const choose = useCallback(async (file: File) => {
    setBusy(true);
    setError(null);
    try {
      const made = await resizeToWebp(file, spec);
      setPicture(made);
      setPreview(URL.createObjectURL(made.blob));
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }, [spec]);

  const clear = useCallback(() => {
    setPicture(null);
    setPreview(null);
    setError(null);
  }, []);

  return { picture, preview, busy, error, choose, clear };
};

type PictureState = ReturnType<typeof usePicture>;

export { usePicture };
export type { PictureState };

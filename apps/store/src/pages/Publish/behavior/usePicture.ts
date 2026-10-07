/* @layer store-site @kind hook */
/**
 * One picture field: the file the author picked, made into the store's webp at once, so
 * the preview shows exactly what will be sent and a picture that cannot fit is refused
 * before anything is submitted. The picked file is kept, so the author can change the crop
 * and the webp is made again from the original. The preview link is released when replaced.
 */
import { useCallback, useEffect, useState } from 'react';
import { errorMessage } from '@site-kit/api/api-error';
import { resizeToWebp } from '../../../lib/resize-image';
import type { Picture, PictureSpec } from '../../../lib/resize-image';
import type { CropRect } from '../../../lib/picture-crop';

const usePicture = (spec: PictureSpec) => {
  const [source, setSource] = useState<File | null>(null);
  const [crop, setCrop] = useState<CropRect | null>(null);
  const [picture, setPicture] = useState<Picture | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  const make = useCallback(async (file: File, cut: CropRect | null) => {
    setBusy(true);
    setError(null);
    try {
      const made = await resizeToWebp(file, spec, cut ?? undefined);
      setPicture(made);
      setPreview(URL.createObjectURL(made.blob));
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }, [spec]);

  const choose = useCallback(async (file: File) => {
    setSource(file);
    setCrop(null);
    await make(file, null);
  }, [make]);

  const recrop = useCallback(async (next: CropRect) => {
    if (!source) return;
    setCrop(next);
    await make(source, next);
  }, [source, make]);

  const clear = useCallback(() => {
    setSource(null);
    setCrop(null);
    setPicture(null);
    setPreview(null);
    setError(null);
  }, []);

  return { spec, source, crop, picture, preview, busy, error, choose, recrop, clear };
};

type PictureState = ReturnType<typeof usePicture>;

export { usePicture };
export type { PictureState };

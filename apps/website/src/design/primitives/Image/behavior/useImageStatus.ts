/* @layer website-site @kind hook */
import { useLayoutEffect, useRef, useState } from 'react';
import type { SyntheticEvent } from 'react';
import type { SettledImage } from './useImageStatus.type';

const settledOf = (source: string, img: HTMLImageElement, ok: boolean): SettledImage => ({
  source,
  status: ok ? 'loaded' : 'broken',
  ratio: ok && img.naturalWidth > 0 ? `${img.naturalWidth} / ${img.naturalHeight}` : undefined,
});

const useImageStatus = (source: string) => {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [settled, setSettled] = useState<SettledImage | null>(null);

  useLayoutEffect(() => {
    const img = imgRef.current;
    if (source && img?.complete) setSettled(settledOf(source, img, img.naturalWidth > 0));
  }, [source]);

  const current = settled?.source === source ? settled : null;

  return {
    imgRef,
    status: current?.status ?? 'loading',
    naturalRatio: current?.ratio,
    onLoad: (event: SyntheticEvent<HTMLImageElement>) => setSettled(settledOf(source, event.currentTarget, true)),
    onError: (event: SyntheticEvent<HTMLImageElement>) => setSettled(settledOf(source, event.currentTarget, false)),
  };
};

export { useImageStatus };

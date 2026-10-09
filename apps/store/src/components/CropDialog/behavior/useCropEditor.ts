/* @layer store-site @kind hook */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { PointerEvent, SyntheticEvent } from 'react';
import { cropAt } from '../../../lib/picture-crop/crop-at';
import { moveCrop } from '../../../lib/picture-crop/move-crop';
import { zoomCrop } from '../../../lib/picture-crop/zoom-crop';
import { zoomOf } from '../../../lib/picture-crop/zoom-of';
import type { CropRect, Size } from '../../../lib/picture-crop/picture-crop.type';
import type { CropEditorParams } from './useCropEditor.type';
import { ZOOM_PER_WHEEL_DELTA } from './useCropEditor.constants';

const useCropEditor = (params: CropEditorParams) => {
  const { source, ratio, initial } = params;
  const [url, setUrl] = useState<string | undefined>(undefined);
  const [size, setSize] = useState<Size | null>(null);
  const [crop, setCrop] = useState<CropRect | null>(null);
  const frameRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLElement>(null);
  const dragFrom = useRef<[number, number] | null>(null);

  useEffect(() => {
    const link = URL.createObjectURL(source);
    setUrl(link);
    return () => URL.revokeObjectURL(link);
  }, [source]);

  const onLoad = useCallback((event: SyntheticEvent<HTMLImageElement>) => {
    const picture = { width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight };
    setSize(picture);
    setCrop(initial ?? cropAt(picture, ratio));
  }, [initial, ratio]);

  const picturePixelsPerScreenPixel = useCallback((current: CropRect) => current.width / (frameRef.current?.clientWidth || 1), []);

  const onPointerDown = useCallback((event: PointerEvent<HTMLElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragFrom.current = [event.clientX, event.clientY];
  }, []);

  const onPointerMove = useCallback((event: PointerEvent<HTMLElement>) => {
    const from = dragFrom.current;
    if (!from || !crop || !size) return;
    const scale = picturePixelsPerScreenPixel(crop);
    setCrop(moveCrop(crop, (from[0] - event.clientX) * scale, (from[1] - event.clientY) * scale, size));
    dragFrom.current = [event.clientX, event.clientY];
  }, [crop, size, picturePixelsPerScreenPixel]);

  const onPointerUp = useCallback(() => {
    dragFrom.current = null;
  }, []);

  const zoom = crop && size ? zoomOf(crop, size, ratio) : 1;

  const setZoom = useCallback((next: number) => {
    if (crop && size) setCrop(zoomCrop(crop, next, size, ratio));
  }, [crop, size, ratio]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      setZoom(zoom * (1 - event.deltaY * ZOOM_PER_WHEEL_DELTA));
    };
    stage.addEventListener('wheel', handleWheel, { passive: false });
    return () => stage.removeEventListener('wheel', handleWheel);
  }, [zoom, setZoom]);

  const reset = useCallback(() => {
    if (size) setCrop(cropAt(size, ratio));
  }, [size, ratio]);

  return { url, size, crop, zoom, frameRef, stageRef, onLoad, onPointerDown, onPointerMove, onPointerUp, setZoom, reset };
};

export { useCropEditor };

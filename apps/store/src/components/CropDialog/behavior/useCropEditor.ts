/* @layer store-site @kind hook */
/**
 * The crop being edited in the crop dialog. The picture is shown behind a frame of the
 * target's shape: dragging moves the picture under the frame, the zoom slider or the mouse
 * wheel changes how much of it the frame holds. The crop starts from the one in use, or the
 * centred, largest one while none was chosen.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { PointerEvent, SyntheticEvent } from 'react';
import { cropAt, moveCrop, zoomCrop, zoomOf } from '../../../lib/picture-crop';
import type { CropRect, Size } from '../../../lib/picture-crop';

/** How much one wheel step changes the zoom. */
const WHEEL_ZOOM = 0.0015;

type CropEditorParams = {
  source: File;
  ratio: number;
  initial: CropRect | null;
};

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

  /** Screen pixels to picture pixels, from the frame's width on screen. */
  const pictureScale = useCallback((current: CropRect) => current.width / (frameRef.current?.clientWidth || 1), []);

  const onPointerDown = useCallback((event: PointerEvent<HTMLElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragFrom.current = [event.clientX, event.clientY];
  }, []);

  const onPointerMove = useCallback((event: PointerEvent<HTMLElement>) => {
    const from = dragFrom.current;
    if (!from || !crop || !size) return;
    const scale = pictureScale(crop);
    setCrop(moveCrop(crop, (from[0] - event.clientX) * scale, (from[1] - event.clientY) * scale, size));
    dragFrom.current = [event.clientX, event.clientY];
  }, [crop, size, pictureScale]);

  const onPointerUp = useCallback(() => {
    dragFrom.current = null;
  }, []);

  const zoom = crop && size ? zoomOf(crop, size, ratio) : 1;

  const setZoom = useCallback((next: number) => {
    if (crop && size) setCrop(zoomCrop(crop, next, size, ratio));
  }, [crop, size, ratio]);

  // a native listener, since React's wheel listener is passive and cannot stop the page scrolling
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      setZoom(zoom * (1 - event.deltaY * WHEEL_ZOOM));
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

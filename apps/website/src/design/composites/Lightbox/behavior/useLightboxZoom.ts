/* @layer website-site @kind hook */
import { useEffect, useRef } from 'react';
import type { PointerEvent } from 'react';
import { DRAGGING_ATTR, REST_ZOOM, WHEEL_LINE_PIXELS, WHEEL_SENSITIVITY, ZOOM_MAX, ZOOM_MIN } from '../Lightbox.constants';
import type { ZoomState } from '../Lightbox.type';
import type { Grab, ZoomTargets } from './useLightboxZoom.type';
import { clampZoom } from './clamp-zoom';
import { paintZoom } from './paint-zoom';
import { zoomAt } from './zoom-at';

const useLightboxZoom = (open: boolean, enabled: boolean, targets: ZoomTargets) => {
  const { overlayRef, panelRef, contentRef } = targets;
  const state = useRef<ZoomState>(REST_ZOOM);
  const grab = useRef<Grab | null>(null);

  useEffect(() => {
    const overlay = overlayRef.current;
    const apply = (next: ZoomState): void => {
      state.current = next;
      paintZoom(contentRef.current, panelRef.current, next);
    };
    if (!open || !enabled || !overlay) return undefined;
    apply(REST_ZOOM);
    const onWheel = (event: WheelEvent): void => {
      event.preventDefault();
      const content = contentRef.current;
      if (!content) return;
      const rect = content.getBoundingClientRect();
      const delta = event.deltaMode === 1 ? event.deltaY * WHEEL_LINE_PIXELS : event.deltaY;
      const scale = Math.min(Math.max(state.current.scale * Math.exp(-delta * WHEEL_SENSITIVITY), ZOOM_MIN), ZOOM_MAX);
      const center = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      const zoomed = zoomAt(state.current, { x: event.clientX, y: event.clientY }, center, scale);
      apply(clampZoom(zoomed, content.offsetWidth, content.offsetHeight));
    };
    overlay.addEventListener('wheel', onWheel, { passive: false });
    return () => overlay.removeEventListener('wheel', onWheel);
  }, [open, enabled, overlayRef, panelRef, contentRef]);

  const onPointerDown = (event: PointerEvent<HTMLElement>): void => {
    if (state.current.scale <= ZOOM_MIN) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    grab.current = { pointer: event.pointerId, startX: event.clientX, startY: event.clientY, from: state.current };
    event.currentTarget.setAttribute(DRAGGING_ATTR, '');
  };

  const onPointerMove = (event: PointerEvent<HTMLElement>): void => {
    const held = grab.current;
    if (held?.pointer !== event.pointerId) return;
    const target = { ...held.from, x: held.from.x + event.clientX - held.startX, y: held.from.y + event.clientY - held.startY };
    const next = clampZoom(target, event.currentTarget.offsetWidth, event.currentTarget.offsetHeight);
    state.current = next;
    paintZoom(contentRef.current, panelRef.current, next);
  };

  const release = (event: PointerEvent<HTMLElement>): void => {
    if (grab.current?.pointer !== event.pointerId) return;
    grab.current = null;
    event.currentTarget.removeAttribute(DRAGGING_ATTR);
  };

  return { onPointerDown, onPointerMove, onPointerUp: release, onPointerCancel: release };
};

export { useLightboxZoom };

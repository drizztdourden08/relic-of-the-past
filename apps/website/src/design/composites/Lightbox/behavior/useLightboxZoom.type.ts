/* @layer website-site @kind types */
import type { RefObject } from 'react';
import type { ZoomState } from '../Lightbox.type';

type Grab = { pointer: number; startX: number; startY: number; from: ZoomState };

type ZoomTargets = {
  overlayRef: RefObject<HTMLElement | null>;
  panelRef: RefObject<HTMLElement | null>;
  contentRef: RefObject<HTMLElement | null>;
};

export type { Grab, ZoomTargets };

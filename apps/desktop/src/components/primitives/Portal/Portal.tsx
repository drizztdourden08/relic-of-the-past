/**
 * Portal — renders children into a named layer in the portal root.
 *
 * Layers are z-ordered DOM containers managed by a single #portal-root.
 * Higher-priority layers render on top. Each layer is created on first use.
 *
 * Usage:
 *   <Portal layer="toast">
 *     <MyToast />
 *   </Portal>
 */

import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

/** Layer definitions — name → z-index. Add new layers here. */
const LAYERS = {
  overlay: 100,
  modal: 200,
  toast: 300,
  tooltip: 400,
} as const;

export type PortalLayer = keyof typeof LAYERS;

interface PortalProps {
  layer: PortalLayer;
  children: ReactNode;
}

/** Lazily ensures #portal-root exists in the DOM. */
function getPortalRoot(): HTMLElement {
  let root = document.getElementById('portal-root');
  if (!root) {
    root = document.createElement('div');
    root.id = 'portal-root';
    root.style.position = 'fixed';
    root.style.inset = '0';
    root.style.pointerEvents = 'none';
    root.style.zIndex = '9000';
    document.body.appendChild(root);
  }
  return root;
}

/** Gets or creates a layer container inside the portal root. */
function getLayerContainer(layer: PortalLayer): HTMLElement {
  const root = getPortalRoot();
  const id = `portal-layer-${layer}`;
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement('div');
    el.id = id;
    el.style.position = 'absolute';
    el.style.inset = '0';
    el.style.pointerEvents = 'none';
    el.style.zIndex = String(LAYERS[layer]);
    root.appendChild(el);
  }
  return el;
}

export function Portal({ layer, children }: PortalProps): React.ReactPortal | null {
  const containerRef = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    containerRef.current = getLayerContainer(layer);
  }, [layer]);

  if (!containerRef.current) {
    // First render — get synchronously (safe because getLayerContainer is idempotent)
    containerRef.current = getLayerContainer(layer);
  }

  return createPortal(children, containerRef.current);
}

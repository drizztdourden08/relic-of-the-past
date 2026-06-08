/* @layer renderer-components @kind component */
﻿import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { type PortalLayer, type PortalProps } from './types';
import { LAYERS } from './constants';


const getPortalRoot = (): HTMLElement => {
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
};

const getLayerContainer = (layer: PortalLayer): HTMLElement => {
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
};

const Portal = (props: PortalProps): React.ReactPortal | null => {
  const { layer, children } = props;
  const containerRef = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    containerRef.current = getLayerContainer(layer);
  }, [layer]);

  if (!containerRef.current) {
    containerRef.current = getLayerContainer(layer);
  }

  return createPortal(children, containerRef.current);
};

export {
  Portal,
};

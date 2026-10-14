/* @layer renderer-other @kind logic */
import type { BackEdge } from '@drizztdourden08/brock-core';
import type { BackEdgePort } from '../../back-edge-port.type';
import { BACK_EVENT } from './capacitor.constants';

const edgeOf = (event: Event): BackEdge => (event instanceof CustomEvent && event.detail === 'left' ? 'left' : 'right');

const createCapacitorBackEdge = (): BackEdgePort => ({
  onBackButton: (cb) => {
    const handler = (event: Event): void => { cb(edgeOf(event)); };
    window.addEventListener(BACK_EVENT, handler);
    return () => { window.removeEventListener(BACK_EVENT, handler); };
  },
});

export { createCapacitorBackEdge };

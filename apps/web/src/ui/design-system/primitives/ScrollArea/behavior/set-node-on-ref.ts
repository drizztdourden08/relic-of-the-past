/* @layer renderer-components @kind util */
import type { Ref } from 'react';

/**
 * Writes a DOM node into whatever form a `ref` prop can carry — a callback
 * ref, an object ref, or none at all — so a component can hold its own
 * handle on the node (for imperative reads/writes) while still handing the
 * same node to whatever ref its caller passed in.
 */
const setNodeOnRef = <T>(ref: Ref<T> | null | undefined, node: T | null): void => {
  if (!ref) return;
  if (typeof ref === 'function') {
    ref(node);
    return;
  }
  (ref as { current: T | null }).current = node;
};

export { setNodeOnRef };

/* @layer renderer-components @kind logic */
import type { MutableRefObject } from 'react';

const applyVidPid = (deviceInfoRef: MutableRefObject<{ vendorId: number; productId: number }>, key: string | undefined): void => {
  if (!key) return;
  const [v = '', p = ''] = key.split(':');
  deviceInfoRef.current.vendorId = parseInt(v, 16);
  deviceInfoRef.current.productId = parseInt(p, 16);
};

export { applyVidPid };

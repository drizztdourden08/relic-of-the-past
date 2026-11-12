/* @layer website-site @kind hook */
import { useState } from 'react';
import type { CollageLayer } from '../../../../../features';
import type { CollageArrangement } from '../CollageVisual.type';
import { swapIntoMain } from './swap-into-main';

const useCollageArrangement = (layers: readonly CollageLayer[]) => {
  const [arrangement, setArrangement] = useState<CollageArrangement>(() => ({
    slots: layers.map((layer) => layer.slot),
    flips: layers.map(() => undefined),
  }));

  const promote = (index: number): void => setArrangement((current) => swapIntoMain(current, index));

  return { arrangement, promote };
};

export { useCollageArrangement };

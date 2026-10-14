/* @layer renderer-widgets @kind hook */
import { useState, useEffect } from 'react';
import { wasmGetOverworldVariant } from '../../../game';
import type { OverworldVariantInfo } from '../../../game';

const useOverworldVariant = (isIndoors: boolean, overworldScreenIndex: number): OverworldVariantInfo | null => {
  const [variant, setVariant] = useState<OverworldVariantInfo | null>(null);

  useEffect(() => {
    if (isIndoors) { setVariant(null); return; }
    setVariant(wasmGetOverworldVariant(overworldScreenIndex));
  }, [overworldScreenIndex, isIndoors]);

  return variant;
};

export { useOverworldVariant };

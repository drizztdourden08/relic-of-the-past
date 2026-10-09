/* @layer renderer-lib @kind hook */
import { useEffect } from 'react';
import { applySpritesForRom } from '../sprites/apply-sprites-for-rom';

const useActivateRomSprites = (romFile: string | null | undefined): void => {
  useEffect(() => {
    if (romFile) void applySpritesForRom(romFile);
  }, [romFile]);
};

export { useActivateRomSprites };

/* @layer renderer-lib @kind hook */
import { useEffect, useRef } from 'react';
import { useSpriteAvailabilityStore } from '../../stores/sprite-availability-store';
import { applySpritesForRom } from './apply-sprites-for-rom';

const useSpriteAvailability = (romFile: string | null | undefined): boolean => {
  const known = useSpriteAvailabilityStore((s) => s.romFile);
  const available = useSpriteAvailabilityStore((s) => s.available);
  const asked = useRef<string | null>(null);

  useEffect(() => {
    if (!romFile) return;
    if (known === romFile && (available || asked.current === romFile)) return;
    asked.current = romFile;
    void applySpritesForRom(romFile);
  }, [romFile, known, available]);

  return available && (!romFile || known === romFile);
};

export { useSpriteAvailability };

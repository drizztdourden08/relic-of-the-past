/* @layer renderer-lib @kind hook */
/**
 * Whether the extracted sprite set of `romFile` can be shown right now. A view
 * drawing art for a ROM asks here rather than reading the flag raw: while the
 * store knows nothing about that ROM, or still says its set is missing, the
 * disk is asked once more (which also starts the background extraction), so a
 * set that IS on disk is never hidden behind a stale "unavailable" — the
 * creation form lists the pool before any profile is active, and a switch to
 * another profile mid-form must not blank it either. A set that is truly
 * missing keeps answering false, asked once per ROM, until the extraction
 * lands and flips the flag. No ROM given: the flag as recorded.
 */
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

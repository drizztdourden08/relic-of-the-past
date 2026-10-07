/* @layer renderer-lib @kind hook */
/**
 * Runs the sprite activation for the ROM in use whenever it changes. Fed from
 * the one seam every path that sets the active profile passes through (startup
 * with a pinned or last profile, creation, selection, load for play), so no
 * call site has to remember it. That seam resolves the ROM through spriteRomOf,
 * which stands a ready ROM in when no profile is active, so the base and the
 * availability flag are set from startup on, and a view that draws item art
 * before any profile exists (the creation form's randomizer panel) is never
 * left showing placeholders over a set that is on disk. Only a library with no
 * ROM at all leaves the last set in place; the views that show art ask
 * useSpriteAvailability for the ROM they draw and re-check on their own.
 */
import { useEffect } from 'react';
import { applySpritesForRom } from './apply-sprites-for-rom';

const useActivateRomSprites = (romFile: string | null | undefined): void => {
  useEffect(() => {
    if (romFile) void applySpritesForRom(romFile);
  }, [romFile]);
};

export { useActivateRomSprites };

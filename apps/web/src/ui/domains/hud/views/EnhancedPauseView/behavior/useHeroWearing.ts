/* @layer renderer-hud @kind hook */
/**
 * What the player character is wearing, and the palette that makes it visible.
 *
 * The core keeps armour and gloves as two small numbers, and the sprite the
 * menu draws is those two numbers applied to a sheet: `resolvePalette` mirrors
 * PushBank in the C player-sprite hook, so the sixteen colours here are the
 * ones the PPU would be holding. That is what makes a tier change on the gear
 * screen repaint the portrait in the same breath as it changes defence, with no
 * separate preview path and no second table to keep in step.
 *
 * The sheet itself is whichever sprite the profile chose, falling back to the
 * one the ROM ships. Loading it is an effect instead of a store because it is
 * a one-shot read of a file that cannot change while a game is running.
 */
import { useEffect, useMemo, useState } from 'react';
import { OUTFIT_IDS } from '@shared/game/data/player-sheet/types';
import { resolvePalette } from '@app/lib/game/player-sheet/resolve-palette';
import { loadSheet } from '@app/lib/game/player-sheet/load-sheet';
import { loadStockSheet } from '@app/lib/game/stock-player-sheet';
import { liveSettingsNow } from '@app/lib/game/live-settings';
import { useGameUIStore } from '@app/stores/game-ui-store';
import { useSpriteAvailabilityStore } from '@app/stores/sprite-availability-store';
import type { GloveLevel, OutfitId, PlayerSheet, Wearing } from '@shared/game/data/player-sheet/types';
import type { ResolvedRow } from '@app/lib/game/player-sheet/resolve-palette';

interface HeroWearing {
  sheet: PlayerSheet | null;
  row: ResolvedRow | null;
  wearing: Wearing;
}

/** Armour tier to outfit. The fourth outfit is its own art, never an armour tier. */
const ARMOUR_OUTFITS: readonly OutfitId[] = OUTFIT_IDS.slice(0, 3);
const MAX_GLOVES = 2;

const outfitFor = (armour: number): OutfitId =>
  ARMOUR_OUTFITS[Math.min(Math.max(armour, 0), ARMOUR_OUTFITS.length - 1)] ?? ARMOUR_OUTFITS[0];

const glovesFor = (gloves: number): GloveLevel =>
  Math.min(Math.max(Math.trunc(gloves) || 0, 0), MAX_GLOVES) as GloveLevel;

/** The chosen sprite over the stock one, with the stock palette behind a
 *  tiles-only container so an imported sheet is never colourless. */
const readSheet = async (romFile: string | null, custom: string | null): Promise<PlayerSheet | null> => {
  const stock = romFile ? await loadStockSheet(romFile) : null;
  if (!custom) return stock;
  return (await loadSheet(custom, stock?.original)) ?? stock;
};

const useHeroWearing = (): HeroWearing => {
  const armour = useGameUIStore((s) => s.equipment.armor);
  const gloves = useGameUIStore((s) => s.equipment.gloves);
  const romFile = useSpriteAvailabilityStore((s) => s.romFile);
  const custom = liveSettingsNow()?.linkSprite ?? null;

  const [sheet, setSheet] = useState<PlayerSheet | null>(null);

  useEffect(() => {
    let live = true;
    void readSheet(romFile, custom).then((next) => { if (live) setSheet(next); });
    return () => { live = false; };
  }, [custom, romFile]);

  const wearing = useMemo<Wearing>(
    () => ({ outfit: outfitFor(armour), gloves: glovesFor(gloves) }),
    [armour, gloves],
  );

  const row = useMemo(() => (sheet ? resolvePalette(sheet, wearing) : null), [sheet, wearing]);

  return { sheet, row, wearing };
};

export { useHeroWearing };
export type { HeroWearing };

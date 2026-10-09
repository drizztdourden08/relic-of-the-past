/* @layer renderer-hud @kind hook */
import { useEffect, useMemo, useState } from 'react';
import { resolvePalette } from '@rotp/packs';
import { loadSheet } from '@app/lib/game/player-sheet/load-sheet';
import { loadStockSheet } from '@app/lib/game/stock-player-sheet';
import { liveSettingsNow } from '@app/lib/game/live-settings';
import { useGameUIStore } from '@app/stores/game-ui-store';
import { useSpriteAvailabilityStore } from '@app/stores/sprite-availability-store';
import type { GloveLevel, OutfitId, PlayerSheet, Wearing } from '@rotp/game-data';
import { ARMOUR_OUTFITS, MAX_GLOVES } from '../EnhancedPauseView.constants';
import type { HeroWearing } from '../EnhancedPauseView.type';

const outfitFor = (armour: number): OutfitId =>
  ARMOUR_OUTFITS[Math.min(Math.max(armour, 0), ARMOUR_OUTFITS.length - 1)] ?? ARMOUR_OUTFITS[0];

const glovesFor = (gloves: number): GloveLevel =>
  Math.min(Math.max(Math.trunc(gloves) || 0, 0), MAX_GLOVES) as GloveLevel;

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

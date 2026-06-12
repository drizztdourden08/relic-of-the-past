/* @layer renderer-lib @kind logic */
/**
 * Points the shared sprite base at the active ROM's own app-sprite:// folder and
 * records whether sprites are actually extracted for it. The enhanced Vanilla
 * HUD reads sprites from this base, so it must always track the ROM in use.
 * Call wherever the active ROM changes (profile select / load / create / boot).
 */
import { setSpritesBase } from '@shared/game/items/sprites';
import { useSpriteAvailabilityStore } from '../../stores/sprite-availability-store';

const applySpritesForRom = async (romFile: string): Promise<void> => {
  setSpritesBase(window.api.getSpritesBaseUrl(romFile));
  try {
    const { extracted } = await window.api.checkSpritesExtracted(romFile);
    useSpriteAvailabilityStore.getState().setAvailability(romFile, extracted);
  } catch {
    useSpriteAvailabilityStore.getState().setAvailability(romFile, false);
  }
};

export { applySpritesForRom };

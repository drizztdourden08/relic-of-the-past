/* @layer renderer-lib @kind logic */
/**
 * Delete a sprite from the library and drop it from every profile that had it selected.
 *
 * A profile's `linkSprite` is only a file name, so removing the file on its own leaves a
 * dangling selection: the boot path logs "not found" and quietly falls back to the stock
 * sheet, which reads as the setting having changed itself. Putting the setting back to its
 * default at delete time keeps the profile honest about what will actually happen, and a
 * running game still wearing the deleted sheet is returned to stock in the same breath.
 *
 * Every profile is checked, not just the active one, because the library is global: a
 * sprite deleted here may be selected by profiles that are not loaded right now, and they
 * would each hit the same dangling selection on their next boot.
 */
import { deleteLinkSprite } from '@app/lib/storage/link-sprites-store';
import { listProfiles, readConfig, writeConfig } from '@app/lib/storage/profile-store';
import { getProfileId } from '../wasm-bridge';
import { setLinkSpriteData } from '../lifecycle';
import { clearPlayerSprite } from '../player-sprite';

/** Deletes the file, then clears the selection wherever it pointed. Returns those profile ids. */
const deleteSprite = async (name: string): Promise<string[]> => {
  await deleteLinkSprite(name);

  const profiles = await listProfiles();
  const cleared: string[] = [];
  for (const profile of profiles) {
    const config = await readConfig(profile.id);
    if (!config || config.linkSprite !== name) continue;
    await writeConfig(profile.id, { ...config, linkSprite: null });
    cleared.push(profile.id);
  }

  // Only the active profile's selection is the one the core is actually wearing, so the
  // live restore is gated on it having been among those cleared.
  const active = getProfileId();
  if (active && cleared.includes(active)) {
    setLinkSpriteData(null);
    clearPlayerSprite();
  }

  return cleared;
};

export { deleteSprite };

/* @layer renderer-widgets @kind hook */
/**
 * Whether the player is in normal play right now: walking the overworld, a dungeon or a special
 * overworld area, with no menu, message or transition running. The writes that change what the
 * HUD draws (a capacity, the heart containers, an item, a bottle, the keys) redraw the HUD at
 * once, and the HUD shares its layer with the message box, so the console offers them only here.
 */
import { useGameUIStore } from '@app/stores/game-ui-store';

/** MODULE_DUNGEON, MODULE_OVERWORLD, MODULE_OVERWORLD_SPECIAL_AREA. */
const PLAY_MODULES: ReadonlySet<number> = new Set([7, 9, 11]);

const IN_PLAY_REASON = 'Available while you play: close the menu or message first';

const useInPlay = (): boolean => useGameUIStore((s) => PLAY_MODULES.has(s.gameMode.mainModule) && s.gameMode.subModule === 0);

export { useInPlay, IN_PLAY_REASON };

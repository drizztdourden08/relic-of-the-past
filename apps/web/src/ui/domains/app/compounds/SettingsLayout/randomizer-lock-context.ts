/* @layer renderer-components @kind logic */
/**
 * The active profile's randomizer-frozen setting keys, threaded to SettingsLayout
 * as a context: about ten settings tabs sit between the profile owner (ProfileHub)
 * and the layout, and none of them care about the value, so a prop would mean a
 * pass-through on every one. Empty when the profile has no randomizer config.
 */
import { createContext } from 'react';

const RandomizerLockContext = createContext<readonly string[]>([]);

export { RandomizerLockContext };

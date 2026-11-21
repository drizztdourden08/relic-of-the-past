/* @layer renderer-app @kind logic */
import { KEYBOARD_PROFILE_IDS } from './profile-name.constants';
import type { NamedProfile } from './profile-name.type';

const isBuiltInKeyboard = (profile: NamedProfile, name: string): boolean => KEYBOARD_PROFILE_IDS.includes(profile.id) && profile.name === name;

export { isBuiltInKeyboard };

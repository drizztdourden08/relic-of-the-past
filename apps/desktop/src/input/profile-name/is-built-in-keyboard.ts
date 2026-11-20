/* @layer renderer-app @kind logic */
import { KEYBOARD_PROFILE_ID } from './profile-name.constants';
import type { NamedProfile } from './profile-name.type';

const isBuiltInKeyboard = (profile: NamedProfile, name: string): boolean => profile.id === KEYBOARD_PROFILE_ID && profile.name === name;

export { isBuiltInKeyboard };

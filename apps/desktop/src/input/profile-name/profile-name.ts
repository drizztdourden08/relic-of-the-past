/* @layer renderer-app @kind logic */
import { KEYBOARD_DEFAULT } from '@rotp/input-mapping';

interface NamedProfile {
  id: string;
  name: string;
}

const KEYBOARD_PROFILE_ID = `default-${KEYBOARD_DEFAULT.id}`;

const isBuiltInKeyboard = (profile: NamedProfile, name: string): boolean => profile.id === KEYBOARD_PROFILE_ID && profile.name === name;

const shownProfileName = (profile: NamedProfile, keyboardName: string): string =>
  isBuiltInKeyboard(profile, KEYBOARD_DEFAULT.name) ? keyboardName : profile.name;

const storedProfileName = (profile: NamedProfile, keyboardName: string): string =>
  isBuiltInKeyboard(profile, keyboardName) ? KEYBOARD_DEFAULT.name : profile.name;

export { shownProfileName, storedProfileName };

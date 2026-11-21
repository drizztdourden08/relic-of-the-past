/* @layer renderer-app @kind logic */
import { KEYBOARD_DEFAULT } from '@rotp/input-mapping';
import { isBuiltInKeyboard } from './is-built-in-keyboard';
import type { NamedProfile } from './profile-name.type';

const storedProfileName = (profile: NamedProfile, keyboardName: string): string =>
  isBuiltInKeyboard(profile, keyboardName) ? KEYBOARD_DEFAULT.name : profile.name;

export { storedProfileName };

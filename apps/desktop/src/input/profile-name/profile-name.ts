/* @layer renderer-app @kind logic */
import { KEYBOARD_DEFAULT } from '@rotp/input-mapping';
import { isBuiltInKeyboard } from './is-built-in-keyboard';
import type { NamedProfile } from './profile-name.type';

const shownProfileName = (profile: NamedProfile, keyboardName: string): string =>
  isBuiltInKeyboard(profile, KEYBOARD_DEFAULT.name) ? keyboardName : profile.name;

export { shownProfileName };

/* @layer renderer-stores @kind logic */
import { openSettingsTarget } from './open-settings-target';

const openVanillaSafeSettings = (): void => openSettingsTarget('vanillaSafe');

export { openVanillaSafeSettings };

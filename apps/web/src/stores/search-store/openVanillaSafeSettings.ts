/* @layer renderer-stores @kind logic */
import { openSettingsTarget } from './openSettingsTarget';

const openVanillaSafeSettings = (): void => openSettingsTarget('vanillaSafe');

export { openVanillaSafeSettings };

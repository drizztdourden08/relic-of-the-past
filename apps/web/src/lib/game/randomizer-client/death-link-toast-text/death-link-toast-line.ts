/* @layer bridge-wasm @kind logic */
import type { DeathLinkNotice } from '../online-notices';
import { deathLinkToastText } from './death-link-toast-text';

const deathLinkToastLine = (notice: DeathLinkNotice): string => {
  const { name, text } = deathLinkToastText(notice);
  return `${name}${text}`;
};

export { deathLinkToastLine };

/* @layer bridge-wasm @kind logic */
import { noticeOf, playerPart } from '../online-notices';
import type { DeathLinkNotice, OnlineNotice } from '../online-notices';
import { deathLinkToastText } from './death-link-toast-text';

const deathLinkOnlineNotice = (notice: DeathLinkNotice): OnlineNotice => {
  const { name, text } = deathLinkToastText(notice);
  return noticeOf('deathLink', name ? [playerPart(name), { text }] : [{ text }]);
};

export { deathLinkOnlineNotice };

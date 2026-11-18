/* @layer electron-main @kind logic */
import type { HandlerGroup } from '@drizztdourden08/brock-electron/main';

const languageHandlers: HandlerGroup = {
  id: 'language',
  register: ({ handle, i18n }) => {
    handle('app:language:set', (_event, tag) => i18n.setLocale(tag));
  },
};

export { languageHandlers };

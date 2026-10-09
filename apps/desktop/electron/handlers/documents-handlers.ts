/* @layer electron-main @kind logic */
import type { HandlerGroup } from '@drizztdourden08/brock-electron/main';
import { openDocument } from '../documents/open-document';

const documentsHandlers: HandlerGroup = {
  id: 'documents',
  register: ({ onOpen }) => {
    onOpen(openDocument);
  },
};

export { documentsHandlers };

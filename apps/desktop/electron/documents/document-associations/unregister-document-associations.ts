/* @layer electron-main @kind logic */
import { CLASSES, DOCUMENT_TYPES, PROTOCOL_KEY } from './document-associations.constants';
import { deleteKey } from './delete-key';
import { notifyShell } from './notify-shell';

const unregisterDocumentAssociations = (): void => {
  if (process.platform !== 'win32') return;
  for (const type of DOCUMENT_TYPES) {
    deleteKey(`${CLASSES}\\${type.extension}`);
    deleteKey(`${CLASSES}\\${type.progId}`);
  }
  deleteKey(PROTOCOL_KEY);
  notifyShell();
};

export { unregisterDocumentAssociations };

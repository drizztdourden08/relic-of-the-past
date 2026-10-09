/* @layer electron-main @kind logic */
import { DOCUMENT_TYPES } from './document-associations.constants';
import { notifyShell } from './notify-shell';
import { registerType } from './register-type';

const registerDocumentAssociations = (): void => {
  if (process.platform !== 'win32') return;
  for (const type of DOCUMENT_TYPES) {
    try {
      registerType(type);
    } catch (err) {
      console.error(`[documents] could not register ${type.extension}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  notifyShell();
};

export { registerDocumentAssociations };

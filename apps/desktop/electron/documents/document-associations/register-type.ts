/* @layer electron-main @kind logic */
import { CLASSES } from './document-associations.constants';
import type { DocumentType } from './document-associations.type';
import { setValue } from './set-value';

const registerType = (type: DocumentType): void => {
  const extKey = `${CLASSES}\\${type.extension}`;
  const progKey = `${CLASSES}\\${type.progId}`;
  setValue(extKey, null, type.progId);
  setValue(extKey, 'Content Type', type.contentType);
  setValue(progKey, null, type.name);
  setValue(`${progKey}\\DefaultIcon`, null, type.icon());
  setValue(`${progKey}\\shell\\open\\command`, null, `"${process.execPath}" "%1"`);
};

export { registerType };

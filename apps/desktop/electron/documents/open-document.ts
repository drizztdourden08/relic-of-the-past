/* @layer electron-main @kind logic */
import type { OpenRequest } from '@drizztdourden08/brock-core/types';
import { importOpenedDocument } from './import-document';
import type { OpenedContainer } from './import-document.type';
import { OPENED_CONTAINERS } from './open-document.constants';

const isOpenedContainer = (ext: string): ext is OpenedContainer => (OPENED_CONTAINERS as readonly string[]).includes(ext);

const openDocument = (request: OpenRequest): void => {
  if (request.kind === 'file' && isOpenedContainer(request.ext)) importOpenedDocument(request.path, request.ext);
};

export { openDocument };

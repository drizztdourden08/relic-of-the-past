/* @layer renderer-lib @kind logic */
import * as languages from '@shared/storage/languages';
import { platformFiles } from '../platform-files';

const exportLanguageSet = (id: string): Promise<Uint8Array> => languages.exportRlang(platformFiles(), id);

export { exportLanguageSet };

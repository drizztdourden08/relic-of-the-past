/* @layer renderer-lib @kind logic */
import * as store from '@shared/storage/profiles';
import { platformFiles } from '../platform-files';

const readConfig = (id: string): Promise<Record<string, unknown> | null> => store.readConfig(platformFiles(), id);

export { readConfig };

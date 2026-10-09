/* @layer renderer-lib @kind logic */
import * as store from '@shared/storage/profiles';
import { platformFiles } from '../platform-files';

const writeConfig = (id: string, settings: Record<string, unknown>): Promise<void> => store.writeConfig(platformFiles(), id, settings);

export { writeConfig };

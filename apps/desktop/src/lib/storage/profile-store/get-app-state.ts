/* @layer renderer-lib @kind logic */
import type { AppState } from '@shared/types/profile';
import * as store from '@shared/storage/profiles';
import { platformFiles } from '../platform-files';

const getAppState = (): Promise<AppState> => store.getAppState(platformFiles());

export { getAppState };

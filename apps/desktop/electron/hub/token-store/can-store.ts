/* @layer electron-main @kind logic */
import { hubSecrets } from './hub-secrets';

const canStore = (): boolean => hubSecrets()?.canStore() ?? false;

export { canStore };

/* @layer electron-main @kind logic */
import { hubSecrets } from './hub-secrets';
import { HUB_TOKEN_SECRET } from './token-store.constants';

const clearToken = async (): Promise<void> => {
  await hubSecrets()?.delete(HUB_TOKEN_SECRET);
};

export { clearToken };

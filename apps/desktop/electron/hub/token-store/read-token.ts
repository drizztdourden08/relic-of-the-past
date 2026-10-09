/* @layer electron-main @kind logic */
import { hubSecrets } from './hub-secrets';
import { HUB_TOKEN_SECRET } from './token-store.constants';

const readToken = async (): Promise<string | null> => {
  const secrets = hubSecrets();
  return secrets ? secrets.get(HUB_TOKEN_SECRET) : null;
};

export { readToken };

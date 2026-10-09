/* @layer electron-main @kind logic */
import { hubSecrets } from './hub-secrets';
import { HUB_TOKEN_LABEL, HUB_TOKEN_SECRET, NO_CONTEXT_ERROR } from './token-store.constants';

const saveToken = async (token: string): Promise<void> => {
  const secrets = hubSecrets();
  if (!secrets) throw new Error(NO_CONTEXT_ERROR);
  await secrets.set(HUB_TOKEN_SECRET, token, HUB_TOKEN_LABEL);
};

export { saveToken };

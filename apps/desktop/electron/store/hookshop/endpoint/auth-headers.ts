/* @layer electron-main @kind logic */
import { readToken } from '../../../hub/token-store';

const authHeaders = async (): Promise<Record<string, string>> => {
  const token = await readToken();
  return token ? { authorization: `Bearer ${token}` } : {};
};

export { authHeaders };

/* @layer site-kit @kind logic */
import { hubApi } from '../hub-client';

const signOut = (everywhere: boolean) =>
  hubApi.request<void>('authSignOut', { query: { everywhere: everywhere ? '1' : undefined } });

export { signOut };

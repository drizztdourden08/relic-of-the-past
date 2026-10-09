/* @layer electron-main @kind logic */
import { SITE_IDS } from '@rotp/hub-contracts';
import type { MainContext } from '@drizztdourden08/brock-electron/main';
import { getSecrets } from '@drizztdourden08/brock-secrets/main';
import { SANCTUARY_API } from './endpoints';
import { fetchMe } from './identity';
import { hubSignInProvider } from './sign-in/hub-sign-in-provider';
import { bindHubContext, clearToken } from './token-store';

const registerHubHandlers = (ctx: MainContext): void => {
  bindHubContext(ctx);
  const secrets = getSecrets(ctx);
  for (const site of SITE_IDS) secrets.registerSignInProvider(hubSignInProvider(site));

  ctx.handle('hub:signOut', async () => {
    for (const site of SITE_IDS) secrets.signIn.cancel(site);
    await clearToken();
  });

  ctx.handle('hub:me', () => fetchMe(SANCTUARY_API));
};

export { registerHubHandlers };

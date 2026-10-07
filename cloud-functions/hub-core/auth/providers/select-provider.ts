/* @layer hub-core @kind logic */
import { isProvider } from '../../../../shared/hub';
import type { Provider } from '../../../../shared/hub';
import { discordProvider } from './discord';
import { githubProvider } from './github';
import { googleProvider } from './google';
import type { OAuthProvider } from './provider.type';

const PROVIDERS: Record<Provider, OAuthProvider> = {
  discord: discordProvider,
  github: githubProvider,
  google: googleProvider,
};

const selectProvider = (name: string): OAuthProvider | null => (isProvider(name) ? PROVIDERS[name] : null);

export { selectProvider };

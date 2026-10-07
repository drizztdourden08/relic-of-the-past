/* @layer root-config @kind logic */
import { isProvider } from '../../../../../shared/sanctuary';
import type { Provider } from '../../../../../shared/sanctuary';
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

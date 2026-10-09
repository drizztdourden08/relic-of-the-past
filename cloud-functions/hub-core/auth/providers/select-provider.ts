/* @layer hub-core @kind logic */
import { isProvider } from '../../../../shared/hub';
import type { OAuthProvider } from './provider.type';
import { PROVIDERS } from './select-provider.constants';

const selectProvider = (name: string): OAuthProvider | null => (isProvider(name) ? PROVIDERS[name] : null);

export { selectProvider };

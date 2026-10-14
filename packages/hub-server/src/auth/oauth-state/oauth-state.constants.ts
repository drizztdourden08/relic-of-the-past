/* @layer hub-core @kind constants */
import type { OauthIntent } from './oauth-state.type';

const OAUTH_INTENTS: readonly OauthIntent[] = ['signin', 'link', 'device'];

export { OAUTH_INTENTS };

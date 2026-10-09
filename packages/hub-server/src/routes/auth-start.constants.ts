/* @layer hub-core @kind constants */
import type { OauthIntent } from '../auth/oauth-state';

const INTENTS: OauthIntent[] = ['signin', 'link', 'device'];

export { INTENTS };

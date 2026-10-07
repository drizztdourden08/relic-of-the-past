/* @layer hub-core @kind logic */
/** GET /auth/:provider/start?intent=signin|link|device&return=/path
 *  Writes the signed state cookie and sends the browser to the provider.
 *  A link needs a session, so a stray click cannot attach a provider to nobody. */
import { generateCodeVerifier } from 'arctic';
import { HUB_ROUTES } from '../../../shared/hub';
import { badRequest } from '../http/http-error';
import { queryParam } from '../http/query';
import { callbackUrlFor } from '../auth/callback-url';
import { selectProvider } from '../auth/providers/select-provider';
import { issueOauthState, safeReturnTo } from '../auth/oauth-state';
import type { OauthIntent } from '../auth/oauth-state';
import { requireSession } from '../auth/require-session';
import type { SiteConfig } from '../site-config.type';
import type { Route } from '../route.type';

const INTENTS: OauthIntent[] = ['signin', 'link', 'device'];

const readIntent = (raw: string | undefined): OauthIntent =>
  (INTENTS as string[]).includes(raw ?? '') ? (raw as OauthIntent) : 'signin';

const authStart = (site: SiteConfig): Route => ({
  ...HUB_ROUTES.authStart,
  handler: async ({ req, res, params }) => {
    const provider = selectProvider(params.provider);
    if (!provider) throw badRequest('Unknown sign-in provider.');
    const intent = readIntent(queryParam(req, 'intent'));
    if (intent === 'link') await requireSession(req);
    const verifier = generateCodeVerifier();
    const requested = queryParam(req, 'return') ?? queryParam(req, 'returnTo');
    const returnTo = safeReturnTo(requested ?? (intent === 'link' ? '/account' : '/'));
    const stateId = await issueOauthState(req, res, { provider: provider.name, intent, verifier, returnTo });
    res.redirect(302, provider.authUrl(stateId, verifier, callbackUrlFor(site, provider.name)).toString());
  },
});

export { authStart };

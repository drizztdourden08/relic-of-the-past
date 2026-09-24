/* @layer root-config @kind logic */
/** GET /auth/:provider/callback?code&state
 *  Sign in or link, one route: exchange the code, read the profile, bind the
 *  identity, create or reuse the user, run the access chain, set the session.
 *  The provider token lives in this function and nowhere else. */
import { SANCTUARY_ROUTES } from '../../../../shared/sanctuary';
import type { Identity } from '../../../../shared/sanctuary';
import { callbackUrlFor, readEnv } from '../env';
import { badRequest } from '../http/http-error';
import { queryParam } from '../http/query';
import { selectProvider } from '../auth/providers/select-provider';
import type { ProviderProfile } from '../auth/providers/provider.type';
import { readOauthState } from '../auth/oauth-state';
import { readSession, startSession } from '../auth/session';
import { evaluateAccess } from '../access/evaluate-access';
import { identitiesRepo } from '../db/identities-repo';
import { usersRepo } from '../db/users-repo';
import { now } from '../db/firestore';
import type { Route, RouteContext } from '../route.type';

const siteUrl = (path: string): string => `${readEnv().SANCTUARY_ORIGIN}${path}`;

const redirectWithError = ({ res }: RouteContext, returnTo: string, error: string): void => {
  const url = new URL(siteUrl(returnTo));
  url.searchParams.set('error', error);
  res.redirect(302, url.toString());
};

const bindIdentity = async (userId: string, provider: Identity['provider'], profile: ProviderProfile): Promise<void> => {
  const identity: Identity = {
    id: `${provider}:${profile.subject}`,
    userId,
    provider,
    subject: profile.subject,
    handle: profile.handle,
    email: profile.email,
    linkedAt: now(),
  };
  await identitiesRepo.upsert(identity);
};

const authCallback: Route = {
  ...SANCTUARY_ROUTES.authCallback,
  handler: async (ctx) => {
    const { req, res, params } = ctx;
    const provider = selectProvider(params.provider);
    if (!provider) throw badRequest('Unknown sign-in provider.');
    const state = await readOauthState(req, res, provider.name);
    const code = queryParam(req, 'code');
    if (!code) return redirectWithError(ctx, state.returnTo, 'denied');

    const { accessToken } = await provider.exchange(code, state.verifier, callbackUrlFor(provider.name));
    const profile = await provider.profile(accessToken);
    const existing = await identitiesRepo.get(`${provider.name}:${profile.subject}`);
    const current = state.intent === 'link' ? await readSession(req) : null;

    if (state.intent === 'link' && !current) return redirectWithError(ctx, '/', 'session-expired');
    if (current && existing && existing.userId !== current.userId) return redirectWithError(ctx, state.returnTo, 'already-linked');

    const userId = current?.userId ?? existing?.userId ?? (await usersRepo.create(profile)).id;
    await bindIdentity(userId, provider.name, profile);
    await usersRepo.setAccess(userId, await evaluateAccess(userId, { provider: provider.name, accessToken }));
    await startSession(res, userId);
    res.redirect(302, siteUrl(state.returnTo));
  },
};

export { authCallback };

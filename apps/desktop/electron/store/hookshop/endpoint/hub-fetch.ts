/* @layer electron-main @kind logic */
import { SIGNED_OUT_MESSAGE, SITE_SIGNED_OUT_MESSAGE, UNAUTHORIZED } from '../hookshop.constants';

const signedOut = (message: string): Response =>
  new Response(JSON.stringify({ error: message }), { status: UNAUTHORIZED, headers: { 'content-type': 'application/json' } });

const hubFetch = async (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
  if (!new Headers(init?.headers).has('authorization')) return signedOut(SIGNED_OUT_MESSAGE);
  const response = await fetch(input, init);
  return response.status === UNAUTHORIZED ? signedOut(SITE_SIGNED_OUT_MESSAGE) : response;
};

export { hubFetch };

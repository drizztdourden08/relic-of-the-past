/* @layer root-config @kind logic */
/** A bearer-authenticated GET that returns the parsed JSON, or throws with the
 *  status when the provider refuses. Provider tokens only ever pass through here. */
import { badGateway } from '../../http/http-error';

const getJson = async <T = Record<string, unknown>>(url: string, accessToken: string): Promise<T> => {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json', 'User-Agent': 'sanctuary-api' },
  });
  if (!res.ok) throw badGateway(`Provider request failed with ${res.status}.`);
  return (await res.json()) as T;
};

export { getJson };

/* @layer hub-core @kind logic */
import { badGateway } from '../../http/http-error';

const getJson = async <T = Record<string, unknown>>(url: string, accessToken: string): Promise<T> => {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json', 'User-Agent': 'sanctuary-api' },
  });
  if (!res.ok) throw badGateway(`Provider request failed with ${res.status}.`);
  return (await res.json()) as T;
};

export { getJson };

/* @layer electron-main @kind logic */
import type { QueryParams } from './endpoints.type';

const queryString = (query: QueryParams): string => {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value) search.set(key, value);
  }
  const text = search.toString();
  return text ? `?${text}` : '';
};

export { queryString };

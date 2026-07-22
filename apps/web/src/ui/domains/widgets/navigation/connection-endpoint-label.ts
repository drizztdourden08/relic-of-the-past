/* @layer renderer-widgets @kind logic */
/**
 * Resolves a connection endpoint id to its screen display name. The editor shows
 * the name prominently with the raw id code secondary; when the id is unknown
 * (not in the screen dataset) `name` is null and `known` is false so the UI can
 * flag it.
 */

import { SCREEN_BY_ID } from '@shared/game/data/screens';

interface EndpointLabel {
  name: string | null;
  code: string;
  known: boolean;
}

const endpointLabel = (id: string): EndpointLabel => {
  const screen = SCREEN_BY_ID.get(id);
  return { name: screen?.name ?? null, code: id, known: screen != null };
};

export { endpointLabel };
export type { EndpointLabel };

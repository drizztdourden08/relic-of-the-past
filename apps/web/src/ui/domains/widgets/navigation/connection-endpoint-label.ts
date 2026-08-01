/* @layer renderer-widgets @kind logic */
/**
 * Resolves a connection endpoint id to its screen display name. The editor shows
 * the name prominently with the raw id code secondary; when the id is unknown
 * (not in the screen dataset) `name` is null and `known` is false so the UI can
 * flag it.
 */

import { findOne } from '@shared/game/data';

interface EndpointLabel {
  name: string | null;
  code: string;
  known: boolean;
}

const endpointLabel = (id: string): EndpointLabel => {
  const screen = findOne('screen', s => s.id === id);
  return { name: screen ? (screen.vanillaName ?? screen.randomizerName) : null, code: id, known: screen != null };
};

export { endpointLabel };
export type { EndpointLabel };

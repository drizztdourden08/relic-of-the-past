/* @layer bridge-wasm @kind logic */
/**
 * Online item helpers — resolve a server item name (community-standard) to the
 * receive-item index the core understands. A progressive family name resolves
 * to its virtual id (progressive-receive-id contract), so the tier a delivery
 * lands at is decided by the core from live inventory at grant time — the same
 * path the local session takes.
 */

import { resolveLocalItemId } from './item-lookup';

const resolveServerItemLocalId = (standardItemName: string): number | undefined =>
  resolveLocalItemId(standardItemName);

export { resolveServerItemLocalId };

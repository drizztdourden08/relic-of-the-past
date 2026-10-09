/* @layer bridge-wasm @kind logic */
import { resolveLocalItemId } from './item-lookup';

const resolveServerItemLocalId = (standardItemName: string): number | undefined =>
  resolveLocalItemId(standardItemName);

export { resolveServerItemLocalId };

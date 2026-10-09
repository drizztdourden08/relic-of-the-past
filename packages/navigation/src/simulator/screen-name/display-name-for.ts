/* @layer bridge-wasm @kind logic */
import type { TraversalId } from '../../simulation';
import { screenNameFor } from './screen-name-for';

const displayNameFor = (id: TraversalId): string => screenNameFor(id) ?? id;

export { displayNameFor };

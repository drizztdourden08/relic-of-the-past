/* @layer shared-game @kind logic */
import type { KnownFormat } from './save-state.type';
import { KNOWN_FORMATS } from './formats';

const formatById = (id: string): KnownFormat | null =>
  KNOWN_FORMATS.find((f) => f.id === id) ?? null;

export { formatById };

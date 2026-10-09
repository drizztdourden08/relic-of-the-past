/* @layer shared-storage @kind logic */
import type { SetStructure } from '@shared/game/language';
import { DEFAULT_STRUCTURE, SET_STRUCTURES } from './format-2.constants';

const asStructure = (value: unknown): SetStructure => (
  SET_STRUCTURES.includes(value as SetStructure) ? value as SetStructure : DEFAULT_STRUCTURE
);

export { asStructure };

/* @layer shared-storage @kind constants */
import type { SetStructure } from '../../messages';

const SET_FORMAT = 2;

const DEFAULT_STRUCTURE: SetStructure = 'continuous';

const SET_STRUCTURES: SetStructure[] = ['continuous', 'block', 'off'];

export { DEFAULT_STRUCTURE, SET_FORMAT, SET_STRUCTURES };

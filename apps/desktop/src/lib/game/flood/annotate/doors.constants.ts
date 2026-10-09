/* @layer bridge-wasm @kind constants */
import type { AnnotationKind, SimDoor } from '@shared/game/simulation';

const THRONE_DOOR = 0x14;

const DOOR_KIND: Partial<Record<SimDoor['kind'], AnnotationKind>> = {
  'small-key': 'key-door',
  'big-key': 'big-key-door',
  bombable: 'bombable',
  shutter: 'shutter',
};

const REQUIRES: Partial<Record<AnnotationKind, string[]>> = {
  'key-door': ['smallkey:*'],
  'big-key-door': ['bigkey:*'],
  bombable: ['bombs'],
};

export { THRONE_DOOR, DOOR_KIND, REQUIRES };

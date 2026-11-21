/* @layer bridge-wasm @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { Message } from '@drizztdourden08/brock-core/i18n';
import type { AnnotationKind, SimDoor } from '../../simulation';

const THRONE_DOOR = 0x14;

const DOOR_KIND: Partial<Record<SimDoor['kind'], AnnotationKind>> = {
  'small-key': 'key-door',
  'big-key': 'big-key-door',
  bombable: 'bombable',
  shutter: 'shutter',
};

const DOOR_LABELS: Partial<Record<AnnotationKind, (index: number) => Message>> = {
  'key-door': (index) => msg('nav-labels:label.keyDoor', { index }),
  'big-key-door': (index) => msg('nav-labels:label.bigKeyDoor', { index }),
  bombable: (index) => msg('nav-labels:label.bombable', { index }),
  shutter: (index) => msg('nav-labels:label.shutter', { index }),
};

const REQUIRES: Partial<Record<AnnotationKind, string[]>> = {
  'key-door': ['smallkey:*'],
  'big-key-door': ['bigkey:*'],
  bombable: ['bombs'],
};

export { THRONE_DOOR, DOOR_KIND, DOOR_LABELS, REQUIRES };

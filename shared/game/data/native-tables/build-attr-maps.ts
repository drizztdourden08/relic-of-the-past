/* @layer shared-game @kind logic */
import type { AttrGroup, AttrMaps } from './attr-group.type';
import { expandAttrs } from './expand-attrs';

const buildAttrMaps = <T,>(groups: readonly AttrGroup<T>[]): AttrMaps<T> => {
  const overworld: Record<number, T> = {};
  const interior: Record<number, T> = {};

  for (const group of groups) {
    for (const attr of expandAttrs(group.attrs)) {
      overworld[attr] = group.value;
      interior[attr] = group.interior ?? group.value;
    }
  }

  return { overworld, interior };
};

export { buildAttrMaps };

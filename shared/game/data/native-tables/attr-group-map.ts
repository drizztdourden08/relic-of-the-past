/* @layer shared-game @kind data */
/**
 * Group → byte-keyed-map expansion, shared by the native tile-attribute tables.
 *
 * Each of those tables is written as an ordered list of groups where one group
 * transcribes one `case` group of `TileDetect_ExecuteInner`
 * (core/zelda3/src/tile_detect.c:261-525). Keeping the list at exactly the
 * switch's granularity is the point: it can be diffed against the C by eye, and
 * no entry can claim a distinction the engine does not make. This module
 * turns such a list into the two maps consumers read.
 *
 * That dispatcher takes exactly one context input, `bool is_indoors`, so the maps
 * are keyed by (attr, indoors) and nothing else. No palace, theme or entrance.
 * A group therefore carries an `interior` value only where the switch really
 * branches on that flag.
 */

interface AttrGroup<T> {
  /** The bytes this group covers, transcribed from the case list. */
  attrs: readonly number[];
  /** Value outdoors, and the only value for a case with no `is_indoors` branch. */
  value: T;
  /** Value indoors. Present only for a genuine `is_indoors` branch site. */
  interior?: T;
}

/** Inclusive byte range, for the cases the engine writes as one long case run. */
const range = (lo: number, hi: number): number[] => {
  const out: number[] = [];
  for (let attr = lo; attr <= hi; attr++) out.push(attr);
  return out;
};

/** Expands a group list into the outdoor map and the indoor map. */
const buildAttrMaps = <T,>(groups: readonly AttrGroup<T>[]) => {
  const overworld: Record<number, T> = {};
  const interior: Record<number, T> = {};

  for (const group of groups) {
    for (const attr of group.attrs) {
      overworld[attr] = group.value;
      interior[attr] = group.interior ?? group.value;
    }
  }

  return { overworld, interior };
};

export { range, buildAttrMaps };
export type { AttrGroup };

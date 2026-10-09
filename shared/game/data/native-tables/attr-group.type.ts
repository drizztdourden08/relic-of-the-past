/* @layer shared-game @kind types */
interface AttrRun {
  from: number;
  to: number;
}

interface AttrGroup<T> {
  attrs: readonly (number | AttrRun)[];
  value: T;
  interior?: T;
}

interface AttrMaps<T> {
  overworld: Record<number, T>;
  interior: Record<number, T>;
}

export type { AttrGroup, AttrMaps, AttrRun };

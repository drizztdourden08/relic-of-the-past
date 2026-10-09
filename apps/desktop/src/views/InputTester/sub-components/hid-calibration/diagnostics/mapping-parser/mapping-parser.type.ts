/* @layer renderer-components @kind types */
interface ParsedMapping {
  guid: string;
  name: string;
  buttonIndexToKey: Map<number, string>;
  hatToKey: Map<string, string>;
  axisIndexToKey: Map<number, string>;
}

export type { ParsedMapping };

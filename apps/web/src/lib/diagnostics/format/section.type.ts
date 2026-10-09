/* @layer renderer-lib @kind types */
interface DebugSection {
  title: string;
  lines: string[];
}

type Line = string | null | false | undefined;

export type { DebugSection, Line };

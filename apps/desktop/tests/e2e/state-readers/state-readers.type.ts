/* @layer tests @kind type */
interface AnnotationRow {
  kind: string;
  glyph: string;
  label: string;
  detail?: string;
  state?: string;
}

interface CheckSummary {
  done: number;
  available: number;
  blocked: number;
}

export type { AnnotationRow, CheckSummary };

/* @layer renderer-components @kind types */
type AnnotationTone = 'checks' | 'locks' | 'triggers' | 'other';

interface AnnotationStyle {
  glyph: string;
  color: string;
  tone: AnnotationTone;
  legend: string;
  panelOnly?: boolean;
}

export type { AnnotationStyle };

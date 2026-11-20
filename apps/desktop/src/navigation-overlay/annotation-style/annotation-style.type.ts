/* @layer renderer-components @kind types */
import type { Message } from '@drizztdourden08/brock-core/i18n';

type AnnotationTone = 'checks' | 'locks' | 'triggers' | 'other';

interface AnnotationStyle {
  glyph: string;
  color: string;
  tone: AnnotationTone;
  legend: Message;
  panelOnly?: boolean;
}

export type { AnnotationStyle };

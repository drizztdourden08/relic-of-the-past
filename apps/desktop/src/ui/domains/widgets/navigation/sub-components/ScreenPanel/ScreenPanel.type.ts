/* @layer renderer-widgets @kind types */
import type { ScreenAnnotation, ScreenAnnotations } from '@shared/game/simulation';

interface ScreenPanelProps {
  annotations: readonly ScreenAnnotations[];
}

type GroupId = 'checks' | 'locks' | 'triggers' | 'other';

interface AnnotationGroup {
  id: GroupId;
  title: string;
  items: ScreenAnnotation[];
}

export type { AnnotationGroup, GroupId, ScreenPanelProps };

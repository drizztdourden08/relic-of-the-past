/* @layer renderer-widgets @kind types */
import type { ScreenAnnotation, ScreenAnnotations } from '@rotp/navigation';

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

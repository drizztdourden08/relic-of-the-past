/* @layer renderer-widgets @kind types */
import type { Message } from '@drizztdourden08/brock-core/i18n';
import type { ScreenAnnotation, ScreenAnnotations } from '@rotp/navigation';

interface ScreenPanelProps {
  annotations: readonly ScreenAnnotations[];
}

type GroupId = 'checks' | 'locks' | 'triggers' | 'other';

interface AnnotationGroup {
  id: GroupId;
  title: Message;
  items: ScreenAnnotation[];
}

export type { AnnotationGroup, GroupId, ScreenPanelProps };

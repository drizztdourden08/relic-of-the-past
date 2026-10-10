/* @layer renderer-widgets @kind types */
import type { AnnotationKind, ScreenAnnotation } from '@rotp/navigation';
import type { GroupId } from '../ScreenPanel.type';

interface AnnotationRowProps {
  item: ScreenAnnotation;
  tone: GroupId;
  off: boolean;
  onToggle: (kind: AnnotationKind) => void;
}

export type { AnnotationRowProps };

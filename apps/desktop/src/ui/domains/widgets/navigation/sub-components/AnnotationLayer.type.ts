/* @layer renderer-widgets @kind types */
import type { ScreenAnnotations } from '@shared/game/simulation';

interface AnnotationLayerProps {
  annotations: ScreenAnnotations | null;
  cellLeft: number;
  cellTop: number;
  cellW: number;
  cellH: number;
}

export type { AnnotationLayerProps };

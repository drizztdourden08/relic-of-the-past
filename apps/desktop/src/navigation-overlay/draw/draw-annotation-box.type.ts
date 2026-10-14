/* @layer renderer-components @kind types */
import type { ScreenAnnotation } from '@rotp/navigation';
import type { AnnotationStyle } from '../annotation-style';
import type { AnnotationRect } from './annotation-rect.type';

interface AnnotationBoxInput {
  ctx: CanvasRenderingContext2D;
  style: AnnotationStyle;
  rect: AnnotationRect;
  state: ScreenAnnotation['state'];
  scale: number;
}

export type { AnnotationBoxInput };

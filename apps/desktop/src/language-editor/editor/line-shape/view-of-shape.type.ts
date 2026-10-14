/* @layer renderer-components @kind types */
import type { GlossaryTerm, GlyphMetrics } from '@rotp/languages';
import type { LineShape } from './line-shape.type';

type ViewOfShapeParams = {
  shape: LineShape;
  index: number;
  box: number;
  metrics: GlyphMetrics;
  glossary: GlossaryTerm[];
};

export type { ViewOfShapeParams };

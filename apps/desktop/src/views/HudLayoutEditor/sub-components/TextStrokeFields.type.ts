/* @layer renderer-components @kind types */
import type { TextSpec } from './TextContent.type';

interface TextStrokeFieldsProps {
  spec: TextSpec;
  onChange: (patch: Partial<TextSpec>) => void;
  scope: Readonly<Record<string, number>>;
  insideRepeat?: boolean;
}

export type { TextStrokeFieldsProps };

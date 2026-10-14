/* @layer renderer-components @kind types */
import type { TextSpec } from './TextContent.type';

interface TextFaceFieldsProps {
  spec: TextSpec;
  onChange: (patch: Partial<TextSpec>) => void;
}

export type { TextFaceFieldsProps };

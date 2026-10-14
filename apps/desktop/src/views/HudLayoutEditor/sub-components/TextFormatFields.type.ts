/* @layer renderer-components @kind types */
import type { TextSpec } from './TextContent.type';

interface TextFormatFieldsProps {
  spec: TextSpec;
  onChange: (patch: Partial<TextSpec>) => void;
}

export type { TextFormatFieldsProps };

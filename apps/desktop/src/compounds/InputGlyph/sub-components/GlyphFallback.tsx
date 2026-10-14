/* @layer renderer-components @kind component */
import { Text } from '@drizztdourden08/tessera/primitives';
import type { GlyphFallbackProps } from '../InputGlyph.type';

const GlyphFallback = ({ variant, label, className }: GlyphFallbackProps) => {
  if (variant === 'plain') return <Text className={`input-glyph__plain ${className}`}>{label}</Text>;
  return <Text as="kbd" className={`input-glyph__key ${className}`}>{label}</Text>;
};

export { GlyphFallback };

/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { IconButton } from '@drizztdourden08/tessera/primitives';
import { GlyphChar } from '../GlyphChar';
import type { GlyphChoiceProps } from './GlyphChoice.type';

const bareGlyphName = (glyph: string | undefined): string => (glyph ?? '').replace(/^\[|\]$/g, '');

const GlyphChoice = (props: GlyphChoiceProps) => {
  const { item, font, onPick } = props;

  const handleClick = useCallback(() => onPick(item.make(null)), [item, onPick]);

  return (
    <IconButton
      className="glyph-popover__cell"
      variant="ghost"
      size="sm"
      label={item.label}
      onClick={handleClick}
    >
      <GlyphChar
        name={bareGlyphName(item.glyph)}
        sheet={font.sheet}
        metrics={font.metrics}
      />
    </IconButton>
  );
};

export { GlyphChoice };

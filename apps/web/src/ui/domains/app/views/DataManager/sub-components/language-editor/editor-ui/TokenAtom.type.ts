/* @layer renderer-components @kind types */
import type { ReactNodeViewProps } from '@tiptap/react';
import type { GlyphFont } from './editor-ui.type';

type TokenAtomProps = ReactNodeViewProps & {
  glyphNames: ReadonlySet<string>;
  font: GlyphFont;
};

export type { TokenAtomProps };

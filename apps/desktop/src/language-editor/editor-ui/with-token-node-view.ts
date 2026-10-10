/* @layer renderer-components @kind logic */
import { createElement } from 'react';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { TokenAtom } from './TokenAtom';
import { DIALOGUE_TOKEN_TYPE } from './editor-contract';
import type { AnyExtension, Extensions, Node as TiptapNode } from '@tiptap/core';
import type { ReactNodeViewProps } from '@tiptap/react';
import type { GlyphFontHandle } from './editor-ui.type';

const rendererFor = (glyphNames: ReadonlySet<string>, font: GlyphFontHandle) => {
  const BoundTokenAtom = (props: ReactNodeViewProps) =>
    createElement(TokenAtom, { ...props, glyphNames, font: font.current });
  return ReactNodeViewRenderer(BoundTokenAtom);
};

const withTokenNodeView = (
  extensions: Extensions,
  glyphNames: ReadonlySet<string>,
  font: GlyphFontHandle,
): Extensions => {
  const renderer = rendererFor(glyphNames, font);
  return extensions.map((extension: AnyExtension) => (
    extension.name === DIALOGUE_TOKEN_TYPE
      ? (extension as TiptapNode).extend({ addNodeView: () => renderer })
      : extension
  ));
};

export { withTokenNodeView };

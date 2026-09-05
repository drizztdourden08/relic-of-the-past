/* @layer renderer-components @kind logic */
/**
 * Attaches this folder's chip to the token node defined in `editor/`.
 *
 * The node is not touched here. Its name, its attributes, and how it parses and
 * serialises all belong to the document model. What is added is purely how it
 * DRAWS, which is presentation and therefore ours: the extension list comes in,
 * the one member named `dialogueToken` comes back out with a React node view
 * bound to it, and everything else passes through untouched.
 *
 * The picture-character set is closed over, not read from a module-level
 * global, so two editors on two different language sets never see each other's
 * alphabet.
 *
 * The FONT is closed over as a handle, not as a value. This runs once per
 * extension list, and the pack's own font is read from disk asynchronously, so
 * the value at this moment is usually null; reading `current` inside the node
 * view's render is what lets a character be drawn once the bytes arrive.
 */
import { ReactNodeViewRenderer } from '@tiptap/react';
import { TokenAtom } from './TokenAtom';
import { DIALOGUE_TOKEN_TYPE } from './editor-contract';
import type { AnyExtension, Extensions, Node as TiptapNode } from '@tiptap/core';
import type { ReactNodeViewProps } from '@tiptap/react';
import type { GlyphFontHandle } from './editor-ui.type';

const rendererFor = (glyphNames: ReadonlySet<string>, font: GlyphFontHandle) => {
  const BoundTokenAtom = (props: ReactNodeViewProps) => (
    <TokenAtom {...props} glyphNames={glyphNames} font={font.current} />
  );
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

/* @layer renderer-components @kind types */
import type { ReactNodeViewProps } from '@tiptap/react';
import type { IconifyIcon } from '@iconify/types';
import type { codeInfoFor } from '@rotp/languages';
import type { DialogueTokenAttrs } from './editor-contract';
import type { GlyphFont } from './editor-ui.type';

type TokenAtomProps = ReactNodeViewProps & {
  glyphNames: ReadonlySet<string>;
  font: GlyphFont;
};

type AtomFacts = {
  name: string | null;
  label: string;
  description: string;
  icon: IconifyIcon;
  value: number | null;
};

type CodeInfo = ReturnType<typeof codeInfoFor>;

type GlyphAtomProps = { name: string; ring: string; font: GlyphFont };

type SubstitutionAtomProps = {
  attrs: DialogueTokenAttrs;
  ring: string;
  description: string;
  font: GlyphFont;
};

type PlainAtomProps = { attrs: DialogueTokenAttrs; facts: AtomFacts; ring: string };

export type { AtomFacts, CodeInfo, GlyphAtomProps, PlainAtomProps, SubstitutionAtomProps, TokenAtomProps };

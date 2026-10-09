/* @layer renderer-hud @kind types */
interface PromptGlyph {
  src: string | null;
  label: string;
}

interface ButtonPromptProps {
  glyphs: PromptGlyph[];
  label: string;
  hold?: boolean;
  height: number;
  ink: string;
  stroke: string;
}

export type { ButtonPromptProps, PromptGlyph };

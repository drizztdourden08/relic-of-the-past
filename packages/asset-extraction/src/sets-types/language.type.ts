/* @layer shared-types @kind types */
interface LanguageMeta {
  code: string;
  glyphCount: number;
  lineCount: number;
  encoder: 'org' | 'new';
  flags: number;
  source: string;
}

interface DialogueLine {
  id: number;
  content: string;
}

interface LanguageFont {
  tiles: number[];
  glyphCount: number;
}

interface LanguagePack {
  meta: LanguageMeta;
  lines: DialogueLine[];
  font: LanguageFont;
}

interface LanguageSummary {
  code: string;
  glyphCount: number;
  lineCount: number;
}

export type { LanguageMeta, DialogueLine, LanguagePack, LanguageSummary };

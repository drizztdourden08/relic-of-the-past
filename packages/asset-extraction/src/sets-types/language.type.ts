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

interface LanguagePack {
  meta: LanguageMeta;
  lines: DialogueLine[];
}

interface LanguageSummary {
  code: string;
  glyphCount: number;
  lineCount: number;
}

export type { LanguageMeta, DialogueLine, LanguagePack, LanguageSummary };

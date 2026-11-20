/* @layer renderer-components @kind types */
interface ProfileLanguage {
  code: string;
  /** Its glyphs need the Japanese sprites, which are not imported yet. */
  locked: boolean;
}

export type { ProfileLanguage };

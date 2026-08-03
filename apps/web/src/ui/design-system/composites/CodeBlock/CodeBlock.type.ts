/* @layer renderer-components @kind types */
type CodeBlockLanguage = 'typescript' | 'json';

interface CodeBlockProps {
  code: string;
  language: CodeBlockLanguage;
  className?: string;
  /** 1-indexed line numbers to mark with the "changed" modifier class. */
  highlightedLines?: readonly number[];
}

export type { CodeBlockLanguage, CodeBlockProps };

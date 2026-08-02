/* @layer renderer-components @kind types */
type CodeBlockLanguage = 'typescript' | 'json';

interface CodeBlockProps {
  code: string;
  language: CodeBlockLanguage;
  className?: string;
}

export type { CodeBlockLanguage, CodeBlockProps };

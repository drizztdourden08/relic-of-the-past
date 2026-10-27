/* @layer website-site @kind types */
type ProseBlock =
  | { kind: 'heading'; level: number; text: string }
  | { kind: 'paragraph'; text: string }
  | { kind: 'list'; items: string[] };

type ProseInline =
  | { kind: 'text'; text: string }
  | { kind: 'bold'; text: string }
  | { kind: 'italic'; text: string }
  | { kind: 'code'; text: string }
  | { kind: 'link'; text: string; href: string };

type ProseProps = {
  source: string;
  hideTitle?: boolean;
};

export type { ProseBlock, ProseInline, ProseProps };

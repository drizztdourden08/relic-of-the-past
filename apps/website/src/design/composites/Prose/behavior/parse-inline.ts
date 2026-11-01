/* @layer website-site @kind logic */
import { INLINE_PATTERN } from '../Prose.constants';
import type { ProseInline } from '../Prose.type';

const nodeOf = (groups: readonly (string | undefined)[]): ProseInline => {
  const [label, href, bold, italic, code, email = ''] = groups;
  if (label !== undefined) return { kind: 'link', text: label, href: href ?? '' };
  if (bold !== undefined) return { kind: 'bold', text: bold };
  if (italic !== undefined) return { kind: 'italic', text: italic };
  if (code !== undefined) return { kind: 'code', text: code };
  return { kind: 'link', text: email, href: `mailto:${email}` };
};

const parseInline = (text: string): ProseInline[] => {
  const nodes: ProseInline[] = [];
  let cursor = 0;
  for (const match of text.matchAll(INLINE_PATTERN)) {
    if (match.index > cursor) nodes.push({ kind: 'text', text: text.slice(cursor, match.index) });
    nodes.push(nodeOf(match.slice(1)));
    cursor = match.index + match[0].length;
  }
  if (cursor < text.length) nodes.push({ kind: 'text', text: text.slice(cursor) });
  return nodes;
};

export { parseInline };

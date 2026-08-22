/* @layer renderer-components @kind logic */
/**
 * The atomic inline node a non-text token occupies in the editor.
 *
 * Everything that is not plain text and genuinely sits IN the run — a mid-line
 * control code, a substitution variable, a glossary reference, a picture
 * character — is ONE indivisible character as far as the caret is concerned: it
 * can be selected and deleted whole, never typed into and never split. Text
 * around it stays ordinary editable text, which is the whole point of the node:
 * a translator types normally and the toolbar drops atoms in at the caret.
 *
 * What is NOT here any more is line structure. A row marker and the wait that
 * closes a box occur only at a line's edges, so they are attributes of the line
 * (see `line-attrs.ts`) rather than objects in the text. The node still knows
 * how to draw one if a paste brings it in, so nothing is ever lost silently.
 *
 * The attribute contract lives in `token-attrs.ts` and the reverse mapping in
 * `attrs-to-token.ts`; this file only declares them to the schema and decides
 * how an atom leaves the editor:
 *
 *   - HTML (copy/paste inside the editor) — `span[data-dialogue-token]` with one
 *     data attribute per field, so a round trip through the clipboard rebuilds
 *     the identical token. The node is a leaf, so its inner label is never
 *     re-parsed as content.
 *   - plain text (copy out, `editor.getText()`) — the bracket form the stored
 *     dialogue format uses, via `serializeTokens`. A glossary reference has no
 *     bracket form, so it renders as `{key}`: unambiguous against the bracket
 *     syntax, and readable. Plain text is one-way; nothing parses it back.
 *
 * Presentation is deliberately absent. The node renders a bare labelled span;
 * chip styling and any interactive parameter editing belong to a node view in
 * the UI layer.
 */
import { Node, mergeAttributes } from '@tiptap/core';
import { serializeTokens } from '@shared/game/language';
import { DIALOGUE_TOKEN_TYPE } from './token-attrs';
import { tokenFromAttrs } from './attrs-to-token';

/** Shape of one entry of the node's attribute map. */
type AttrSpec = {
  default: unknown;
  parseHTML: (element: HTMLElement) => unknown;
  renderHTML: (attributes: Record<string, unknown>) => Record<string, string>;
};

/** Absent fields are omitted from the DOM rather than written as "null". */
const renderIf = (dataName: string, value: unknown): Record<string, string> => (
  value === null || value === undefined ? {} : { [dataName]: String(value) }
);

const numberAttr = (element: HTMLElement, dataName: string): number | null => {
  const raw = element.getAttribute(dataName);
  if (raw === null || raw.trim() === '') return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
};

const textAttr = (field: string, dataName: string): AttrSpec => ({
  default: null,
  parseHTML: (element) => element.getAttribute(dataName),
  renderHTML: (attributes) => renderIf(dataName, attributes[field]),
});

const numericAttr = (field: string, dataName: string): AttrSpec => ({
  default: null,
  parseHTML: (element) => numberAttr(element, dataName),
  renderHTML: (attributes) => renderIf(dataName, attributes[field]),
});

const kindAttr: AttrSpec = {
  default: 'cmd',
  parseHTML: (element) => element.getAttribute('data-kind') ?? 'cmd',
  renderHTML: (attributes) => ({ 'data-kind': String(attributes.kind ?? 'cmd') }),
};

/** The atom's human-facing text: bracket form, or `{key}` for a reference. */
const plainTextOf = (attrs: Record<string, unknown> | null | undefined): string => {
  const token = tokenFromAttrs(attrs);
  if (token === null) return '';
  if (token.t === 'ref') return `{${token.key}}`;
  return serializeTokens([token]);
};

const DialogueToken = Node.create({
  name: DIALOGUE_TOKEN_TYPE,
  inline: true,
  group: 'inline',
  atom: true,
  selectable: true,
  draggable: false,

  addAttributes: () => ({
    kind: kindAttr,
    name: textAttr('name', 'data-name'),
    param: numericAttr('param', 'data-param'),
    row: numericAttr('row', 'data-row'),
    slot: numericAttr('slot', 'data-slot'),
    key: textAttr('key', 'data-key'),
  }),

  parseHTML: () => [{ tag: 'span[data-dialogue-token]' }],

  renderHTML: ({ node, HTMLAttributes }) => [
    'span',
    mergeAttributes({ 'data-dialogue-token': '' }, HTMLAttributes),
    plainTextOf(node.attrs),
  ],

  renderText: ({ node }) => plainTextOf(node.attrs),
});

export { DialogueToken, plainTextOf };

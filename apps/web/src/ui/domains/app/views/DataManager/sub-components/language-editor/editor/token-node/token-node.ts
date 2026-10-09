/* @layer renderer-components @kind logic */
import { Node, mergeAttributes } from '@tiptap/core';
import { DIALOGUE_TOKEN_TYPE } from '../token-attrs';
import { plainTextOf } from './plain-text-of';
import type { AttrSpec } from './token-node.type';

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

export { DialogueToken };

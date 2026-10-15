/* @layer renderer-components @kind logic */
import { Extension } from '@tiptap/core';
import { Document } from '@tiptap/extension-document';
import { Text } from '@tiptap/extension-text';
import { Placeholder } from '@tiptap/extension-placeholder';
import { history } from '@tiptap/pm/history';
import { AutoWrap } from './auto-wrap';
import { Renumber } from './renumber';
import { GutterRefresh } from './gutter-refresh';
import { ChoiceLines } from './choice-lines';
import { DialogueLine } from './line-paragraph';
import { DialogueToken } from './token-node';
import type { Extensions } from '@tiptap/core';
import type { DialogueSchemaOptions } from './schema.type';

const EditHistory = Extension.create({
  name: 'dialogueHistory',
  addProseMirrorPlugins: () => [history()],
});

const LineStackDocument = Document.extend({ content: 'paragraph+' });

const dialogueExtensions = (options?: DialogueSchemaOptions): Extensions => [
  LineStackDocument,
  DialogueLine,
  Text,
  DialogueToken,
  EditHistory,
  AutoWrap,
  GutterRefresh,
  ChoiceLines,
  Renumber,
  Placeholder.configure({ placeholder: options?.placeholder ?? '' }),
];

export { dialogueExtensions };

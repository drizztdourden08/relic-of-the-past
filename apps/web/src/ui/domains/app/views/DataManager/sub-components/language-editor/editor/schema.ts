/* @layer renderer-components @kind logic */
/**
 * The editor's extension list — the smallest schema that can hold a dialogue
 * entry and nothing else.
 *
 * The document is a STACK OF LINES: `paragraph+`, one paragraph per line. That
 * is a change from the single-run schema this replaces, and it is the point of
 * the rework — the engine writes into a three-row box and never wraps, so the
 * thing being edited is a stack of lines, not one long run with control codes
 * buried in it. Enter makes a line, Backspace at a line's start unmakes one, and
 * both are the line node's own business (see `line-paragraph.ts`).
 *
 * There is no mark of any kind in this list, deliberately: the target format has
 * no bold, italic, heading or list, so the schema must not offer one. Nothing
 * pastes in as formatting either — an unknown mark has no type to parse into and
 * is dropped to plain text.
 */
import { Document } from '@tiptap/extension-document';
import { Text } from '@tiptap/extension-text';
import { Placeholder } from '@tiptap/extension-placeholder';
import { DialogueLine } from './line-paragraph';
import { DialogueToken } from './token-node';
import type { Extensions } from '@tiptap/core';

type DialogueSchemaOptions = {
  /** Prompt shown while the entry is empty; omit for none. */
  placeholder?: string;
};

/** Paragraphs only, one or more — a line is the only block this format has. */
const LineStackDocument = Document.extend({ content: 'paragraph+' });

const dialogueExtensions = (options?: DialogueSchemaOptions): Extensions => [
  LineStackDocument,
  DialogueLine,
  Text,
  DialogueToken,
  Placeholder.configure({ placeholder: options?.placeholder ?? '' }),
];

export { dialogueExtensions };
export type { DialogueSchemaOptions };

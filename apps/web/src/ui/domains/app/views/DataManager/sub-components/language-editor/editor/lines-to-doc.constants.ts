/* @layer renderer-components @kind constants */
import type { JSONContent } from '@tiptap/core';
import { attrsForLine } from './line-attrs';

const EMPTY_LINE: JSONContent = { type: 'paragraph', attrs: attrsForLine(null, false) };

export { EMPTY_LINE };

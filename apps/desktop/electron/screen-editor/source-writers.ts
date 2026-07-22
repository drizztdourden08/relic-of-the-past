/* @layer electron-main @kind logic */
/**
 * Shared regex-based write helpers for the screen/check editor IPC handlers.
 * Both operate on a TS source file that exports an array literal: insert a
 * new entry before the closing `];`, or replace the object literal whose
 * `id: '<id>'` matches.
 */

const escapeRegex = (s: string): string => {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const escapeSingleQuote = (s: string): string => {
  return s.replace(/'/g, "\\'");
};

// Insert `code` immediately before the last `];` in the file.
const insertBeforeArrayClose = (content: string, code: string): { content: string; error?: string } => {
  const lastBracket = content.lastIndexOf('];');
  if (lastBracket === -1) {
    return { content, error: 'Could not find array closing bracket in file' };
  }
  return {
    content: content.slice(0, lastBracket) + code + '\n' + content.slice(lastBracket),
  };
};

// Replace the object literal whose `id: '<id>'` field matches with `code`.
const replaceById = (content: string, id: string, code: string): { content: string; error?: string } => {
  const idPattern = new RegExp(
    `(\\{[^}]*id:\\s*'${escapeRegex(id)}'[^}]*\\},?)`,
    's',
  );
  const match = content.match(idPattern);
  if (!match) {
    return { content, error: `Could not find id '${id}' in file` };
  }
  return { content: content.replace(match[0], code) };
};

// Match the whole object literal (plus its line) whose `from`/`to` both match.
// Safe against the `tags: [...]` array (brackets, not braces); does not match
// entries carrying a nested `nav: { ... }` object.
const connectionLinePattern = (from: string, to: string): RegExp =>
  new RegExp(
    `[ \\t]*\\{[^{}]*from:\\s*'${escapeRegex(from)}'[^{}]*to:\\s*'${escapeRegex(to)}'[^{}]*\\},?\\n?`,
  );

// Remove the connection whose `from`+`to` endpoints match.
const removeConnectionByEndpoints = (content: string, from: string, to: string): { content: string; error?: string } => {
  const pattern = connectionLinePattern(from, to);
  const match = content.match(pattern);
  if (!match) {
    return { content, error: `Could not find connection '${from}' → '${to}' in file` };
  }
  return { content: content.replace(match[0], '') };
};

// Replace the connection whose `from`+`to` endpoints match with `code`.
const replaceConnectionByEndpoints = (content: string, from: string, to: string, code: string): { content: string; error?: string } => {
  const pattern = connectionLinePattern(from, to);
  const match = content.match(pattern);
  if (!match) {
    return { content, error: `Could not find connection '${from}' → '${to}' in file` };
  }
  const replacement = code.endsWith('\n') ? code : `${code}\n`;
  return { content: content.replace(match[0], replacement) };
};

export {
  escapeRegex,
  escapeSingleQuote,
  insertBeforeArrayClose,
  replaceById,
  removeConnectionByEndpoints,
  replaceConnectionByEndpoints,
};

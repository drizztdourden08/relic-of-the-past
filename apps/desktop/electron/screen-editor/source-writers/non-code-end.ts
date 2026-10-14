/* @layer electron-main @kind logic */
const lineCommentEnd = (content: string, start: number): number => {
  const newline = content.indexOf('\n', start + 2);
  return newline === -1 ? content.length : newline;
};

const blockCommentEnd = (content: string, start: number): number => {
  const close = content.indexOf('*/', start + 2);
  return close === -1 ? content.length : close + 1;
};

const quoteEnd = (content: string, start: number): number => {
  const quote = content[start];
  let at = start + 1;
  while (at < content.length) {
    if (content[at] === '\\') at += 2;
    else if (content[at] === quote) return at;
    else at++;
  }
  return content.length;
};

const nonCodeEnd = (content: string, at: number): number => {
  const ch = content[at];
  const next = content[at + 1];
  if (ch === '/' && next === '/') return lineCommentEnd(content, at);
  if (ch === '/' && next === '*') return blockCommentEnd(content, at);
  if (ch === "'" || ch === '"' || ch === '`') return quoteEnd(content, at);
  return -1;
};

export { nonCodeEnd };

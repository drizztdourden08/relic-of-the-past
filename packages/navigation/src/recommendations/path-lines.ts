/* @layer shared-game @kind logic */
import { childPath } from './child-path';
import type { Frame, PathScan } from './path-lines.type';

const isKeyChar = (ch: string): boolean => /[A-Za-z0-9_$]/.test(ch);
const isSpace = (ch: string): boolean => /\s/.test(ch);
const isQuote = (ch: string): boolean => ch === '"' || ch === "'" || ch === '`';

const quotedKeyBefore = (source: string, quoteAt: number): string | null => {
  const quote = source.charAt(quoteAt);
  const start = source.lastIndexOf(quote, quoteAt - 1);
  return start < 0 ? null : source.slice(start + 1, quoteAt);
};

const keyBefore = (source: string, colonAt: number): string | null => {
  let i = colonAt - 1;
  while (i >= 0 && isSpace(source.charAt(i))) i -= 1;
  if (i < 0) return null;
  const quote = source.charAt(i);
  if (quote === '"' || quote === "'") return quotedKeyBefore(source, i);
  const end = i;
  while (i >= 0 && isKeyChar(source.charAt(i))) i -= 1;
  return end > i ? source.slice(i + 1, end + 1) : null;
};

const markLine = (scan: PathScan, path: string): void => {
  if (!scan.lines.has(path)) scan.lines.set(path, scan.line);
};

const currentFrame = (scan: PathScan): Frame => {
  const frame = scan.stack.at(-1);
  if (frame === undefined) throw new Error('The path stack lost its root frame');
  return frame;
};

const onColon = (scan: PathScan, frame: Frame): void => {
  const key = keyBefore(scan.source, scan.i);
  if (key === null) return;
  scan.pendingPath = childPath(frame.path, key, false);
  markLine(scan, scan.pendingPath);
};

const openedPath = (scan: PathScan, frame: Frame): string => {
  if (scan.pendingPath !== null) return scan.pendingPath;
  return frame.isArray ? childPath(frame.path, String(frame.index), true) : frame.path;
};

const onOpen = (scan: PathScan, frame: Frame, ch: string): void => {
  const path = openedPath(scan, frame);
  if (frame.isArray && scan.pendingPath === null) {
    markLine(scan, path);
    frame.index += 1;
  }
  scan.stack.push({ path, isArray: ch === '[', index: 0 });
  scan.pendingPath = null;
};

const onClose = (scan: PathScan): void => {
  if (scan.stack.length > 1) scan.stack.pop();
  scan.pendingPath = null;
};

const skipScalar = (scan: PathScan): void => {
  const { source } = scan;
  while (scan.i < source.length && source.charAt(scan.i) !== ',' && source.charAt(scan.i) !== ']') {
    const ch = source.charAt(scan.i);
    if (ch === '\n') scan.line += 1;
    if (ch === '"' || ch === "'") {
      const end = source.indexOf(ch, scan.i + 1);
      scan.i = end < 0 ? source.length : end;
    }
    scan.i += 1;
  }
  scan.i -= 1;
};

const onScalar = (scan: PathScan, frame: Frame): void => {
  markLine(scan, childPath(frame.path, String(frame.index), true));
  skipScalar(scan);
  frame.index += 1;
};

const onStructure = (scan: PathScan, ch: string): void => {
  const frame = currentFrame(scan);
  if (ch === ':' && !frame.isArray) return onColon(scan, frame);
  if (ch === '{' || ch === '[') return onOpen(scan, frame, ch);
  if (ch === '}' || ch === ']') return onClose(scan);
  if (ch === ',') {
    scan.pendingPath = null;
    return;
  }
  if (frame.isArray && !isSpace(ch)) onScalar(scan, frame);
};

const onQuoted = (scan: PathScan, ch: string): void => {
  if (ch === '\\') scan.i += 1;
  else if (ch === scan.quote) scan.quote = null;
};

const step = (scan: PathScan): void => {
  const ch = scan.source.charAt(scan.i);
  if (ch === '\n') scan.line += 1;
  else if (scan.quote) onQuoted(scan, ch);
  else if (isQuote(ch)) scan.quote = ch;
  else onStructure(scan, ch);
};

const pathLines = (source: string): ReadonlyMap<string, number> => {
  const scan: PathScan = {
    source,
    lines: new Map<string, number>(),
    stack: [{ path: '', isArray: false, index: 0 }],
    line: 1,
    quote: null,
    pendingPath: null,
    i: 0,
  };
  for (; scan.i < source.length; scan.i += 1) step(scan);
  return scan.lines;
};

export { pathLines };

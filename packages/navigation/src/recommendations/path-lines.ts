/* @layer shared-game @kind logic */
import { childPath } from './child-path';
import type { Frame } from './path-lines.type';

const isKeyChar = (ch: string): boolean => /[A-Za-z0-9_$]/.test(ch);

const keyBefore = (source: string, colonAt: number): string | null => {
  let i = colonAt - 1;
  while (i >= 0 && /\s/.test(source[i])) i -= 1;
  if (i < 0) return null;
  const quote = source[i];
  if (quote === '"' || quote === "'") {
    const start = source.lastIndexOf(quote, i - 1);
    return start < 0 ? null : source.slice(start + 1, i);
  }
  const end = i;
  while (i >= 0 && isKeyChar(source[i])) i -= 1;
  return end > i ? source.slice(i + 1, end + 1) : null;
};

const pathLines = (source: string): ReadonlyMap<string, number> => {
  const lines = new Map<string, number>();
  const stack: Frame[] = [{ path: '', isArray: false, index: 0 }];
  let line = 1;
  let quote: string | null = null;
  let pendingPath: string | null = null;

  for (let i = 0; i < source.length; i += 1) {
    const ch = source[i];

    if (ch === '\n') { line += 1; continue; }

    if (quote) {
      if (ch === '\\') { i += 1; continue; }
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') { quote = ch; continue; }

    const frame = stack[stack.length - 1];

    if (ch === ':' && !frame.isArray) {
      const key = keyBefore(source, i);
      if (key !== null) {
        pendingPath = childPath(frame.path, key, false);
        if (!lines.has(pendingPath)) lines.set(pendingPath, line);
      }
      continue;
    }

    if (ch === '{' || ch === '[') {
      const path = pendingPath ?? (frame.isArray ? childPath(frame.path, String(frame.index), true) : frame.path);
      if (frame.isArray && pendingPath === null) {
        if (!lines.has(path)) lines.set(path, line);
        frame.index += 1;
      }
      stack.push({ path, isArray: ch === '[', index: 0 });
      pendingPath = null;
      continue;
    }

    if (ch === '}' || ch === ']') {
      if (stack.length > 1) stack.pop();
      pendingPath = null;
      continue;
    }

    if (ch === ',') { pendingPath = null; continue; }

    if (frame.isArray && !/\s/.test(ch)) {
      const path = childPath(frame.path, String(frame.index), true);
      if (!lines.has(path)) lines.set(path, line);
      while (i < source.length && source[i] !== ',' && source[i] !== ']') {
        if (source[i] === '\n') line += 1;
        if (source[i] === '"' || source[i] === "'") {
          const end = source.indexOf(source[i], i + 1);
          i = end < 0 ? source.length : end;
        }
        i += 1;
      }
      i -= 1;
      frame.index += 1;
    }
  }

  return lines;
};

export { pathLines };

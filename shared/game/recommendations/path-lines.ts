/* @layer shared-game @kind logic */
/**
 * Every path in a serialized record, mapped to the line it is written on.
 *
 * This exists so a comparison view can highlight the lines a structural diff
 * already identified, without diffing the TEXT a second time. It scans
 * characters rather than matching per-line regexes because both serializations
 * it has to read are free-form: the record emitter writes unquoted keys, single
 * quotes and trailing commas, and puts several fields on one line; JSON writes
 * none of those. A brace/bracket scanner handles both, and — crucially — knows
 * when a `{` is inside a string and therefore not a container at all.
 */

/** One open container, and where inside it the scan currently sits. */
interface Frame {
  path: string;
  isArray: boolean;
  /** Next array index to assign; unused for objects. */
  index: number;
}

const isKeyChar = (ch: string): boolean => /[A-Za-z0-9_$]/.test(ch);

/** `a.b` for an object member, `a[0]` for an array element, bare at the root. */
const childPath = (parent: string, segment: string, isIndex: boolean): string => {
  if (isIndex) return `${parent}[${segment}]`;
  return parent ? `${parent}.${segment}` : segment;
};

/**
 * Reads the quoted or bare key that ends at `colonAt`, scanning backwards.
 * Returns null when nothing key-shaped precedes the colon — a colon inside a
 * string never reaches here, but one in an unexpected position should be
 * ignored rather than invent a segment.
 */
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

/**
 * Path → 1-based line number, for every member and element the source declares.
 *
 * A container records the line its KEY sits on, so a nested object highlights
 * where a reader would look for it rather than at its closing brace.
 */
const pathLines = (source: string): ReadonlyMap<string, number> => {
  const lines = new Map<string, number>();
  const stack: Frame[] = [{ path: '', isArray: false, index: 0 }];
  let line = 1;
  let quote: string | null = null;
  // The member path the next `{` or `[` opens, set when its `key:` is read.
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
      // An array ELEMENT that is itself a container has no key of its own, so it
      // takes the next index in the array it sits in.
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

    // A scalar array element: the first non-space character after the opening
    // bracket or the previous comma claims the next index.
    if (frame.isArray && !/\s/.test(ch)) {
      const path = childPath(frame.path, String(frame.index), true);
      if (!lines.has(path)) lines.set(path, line);
      // Consume the rest of this element so one value claims exactly one index.
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

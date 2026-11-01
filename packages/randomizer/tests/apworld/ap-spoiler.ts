/* @layer tests @kind helper */
interface ApSpoiler {
  placements: Map<string, string>;
  spheres: [string, string][][];
}

type Sphere = [string, string][];

type Cursor = { section: string; sphere: Sphere | null };

const BYTE_ORDER_MARK = 0xfeff;
const SECTION_HEADER = /^([A-Z][A-Za-z ]+):\s*$/;
const SPHERE_OPEN = /^\d+: \{$/;

const splitEntry = (line: string): [string, string] | null => {
  const at = line.lastIndexOf(': ');
  return at <= 0 ? null : [line.slice(0, at).trim(), line.slice(at + 2).trim()];
};

const entryOf = (line: string): [string, string] | null => (line.trim() === '' ? null : splitEntry(line));

const readPlaythroughLine = (line: string, spheres: Sphere[], current: Sphere | null): Sphere | null => {
  if (SPHERE_OPEN.test(line)) return [];
  if (current === null) return null;
  if (line.startsWith('}')) {
    spheres.push(current);
    return null;
  }
  const entry = entryOf(line);
  if (entry !== null) current.push(entry);
  return current;
};

const readLine = (line: string, cursor: Cursor, parsed: ApSpoiler): void => {
  const header = SECTION_HEADER.exec(line);
  if (header !== null && cursor.sphere === null) cursor.section = header[1] ?? '';
  else if (cursor.section === 'Locations') {
    const entry = entryOf(line);
    if (entry !== null) parsed.placements.set(entry[0], entry[1]);
  } else if (cursor.section === 'Playthrough') cursor.sphere = readPlaythroughLine(line, parsed.spheres, cursor.sphere);
};

const parseApSpoiler = (text: string): ApSpoiler => {
  const parsed: ApSpoiler = { placements: new Map<string, string>(), spheres: [] };
  const cursor: Cursor = { section: '', sphere: null };
  const body = text.charCodeAt(0) === BYTE_ORDER_MARK ? text.slice(1) : text;
  for (const line of body.split(/\r?\n/)) readLine(line, cursor, parsed);
  const { placements, spheres } = parsed;
  if (placements.size === 0 || spheres.length === 0) throw new Error('spoiler has no locations or no playthrough');
  return { placements, spheres };
};

export { parseApSpoiler };
export type { ApSpoiler };

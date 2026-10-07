/* @layer tests @kind helper */
/**
 * Reads an Archipelago spoiler log of a one-player Relic of the Past seed: the `Locations:`
 * section (every location and the item on it) and the `Playthrough:` spheres. An entry line
 * splits at its LAST ": ", because a location name never carries one.
 */

interface ApSpoiler {
  placements: Map<string, string>;
  spheres: [string, string][][];
}

/** The spoiler starts with one, written by Archipelago's text output. */
const BYTE_ORDER_MARK = 0xfeff;

const splitEntry =(line: string): [string, string] | null => {
  const at = line.lastIndexOf(': ');
  return at <= 0 ? null : [line.slice(0, at).trim(), line.slice(at + 2).trim()];
};

const parseApSpoiler = (text: string): ApSpoiler => {
  const placements = new Map<string, string>();
  const spheres: [string, string][][] = [];
  let section = '';
  let sphere: [string, string][] | null = null;
  const body = text.charCodeAt(0) === BYTE_ORDER_MARK ? text.slice(1) : text;
  for (const line of body.split(/\r?\n/)) {
    const header = /^([A-Z][A-Za-z ]+):\s*$/.exec(line);
    if (header !== null && sphere === null) {
      section = header[1];
      continue;
    }
    if (section === 'Locations' && line.trim() !== '') {
      const entry = splitEntry(line);
      if (entry !== null) placements.set(entry[0], entry[1]);
    }
    if (section !== 'Playthrough') continue;
    if (/^\d+: \{$/.test(line)) sphere = [];
    else if (line.startsWith('}') && sphere !== null) {
      spheres.push(sphere);
      sphere = null;
    } else if (sphere !== null && line.trim() !== '') {
      const entry = splitEntry(line);
      if (entry !== null) sphere.push(entry);
    }
  }
  if (placements.size === 0 || spheres.length === 0) throw new Error('spoiler has no locations or no playthrough');
  return { placements, spheres };
};

export { parseApSpoiler };
export type { ApSpoiler };

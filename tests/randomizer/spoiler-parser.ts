/* @layer tests @kind helper */
/**
 * Tolerant text parser for the oracle spoiler logs (tests/fixtures/ap-oracle):
 * pulls the medallion rolls, the full location→item section, and the
 * playthrough spheres. Section headers are full lines ending in ':'; entry
 * lines split at the LAST ': ' (location names never contain a colon, item
 * names never contain ': ').
 */

interface OracleSphere {
  index: number;
  entries: [string, string][];
}

interface OracleSpoiler {
  medallions: { mire: string; turtleRock: string };
  /** Every line of the Locations section — locked and event slots included. */
  placements: Map<string, string>;
  spheres: OracleSphere[];
}

const splitEntry = (line: string): [string, string] | null => {
  const at = line.lastIndexOf(': ');
  if (at <= 0) return null;
  return [line.slice(0, at).trim(), line.slice(at + 2).trim()];
};

const parseOracleSpoiler = (text: string): OracleSpoiler => {
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/);
  let section = '';
  let mire = '';
  let turtleRock = '';
  const placements = new Map<string, string>();
  const spheres: OracleSphere[] = [];
  let currentSphere: OracleSphere | null = null;

  for (const line of lines) {
    const header = line.match(/^([A-Za-z][A-Za-z' ]+):\s*$/);
    if (header !== null && currentSphere === null) {
      section = header[1];
      continue;
    }
    if (section === 'Medallions') {
      const entry = line.match(/^(Misery Mire|Turtle Rock).*?:\s+(\w+)\s*$/);
      if (entry !== null) {
        if (entry[1] === 'Misery Mire') mire = entry[2];
        else turtleRock = entry[2];
      }
    } else if (section === 'Locations') {
      if (line.trim() === '') continue;
      const entry = splitEntry(line);
      if (entry !== null) placements.set(entry[0], entry[1]);
    } else if (section === 'Playthrough') {
      const open = line.match(/^(\d+): \{$/);
      if (open !== null) {
        currentSphere = { index: Number(open[1]), entries: [] };
        continue;
      }
      if (line.startsWith('}')) {
        if (currentSphere !== null) spheres.push(currentSphere);
        currentSphere = null;
        continue;
      }
      if (currentSphere !== null && line.trim() !== '') {
        const entry = splitEntry(line);
        if (entry !== null) currentSphere.entries.push(entry);
      }
    }
  }

  if (mire === '' || turtleRock === '') throw new Error('spoiler missing medallion lines');
  if (placements.size === 0) throw new Error('spoiler missing the locations section');
  if (spheres.length === 0) throw new Error('spoiler missing the playthrough section');
  return { medallions: { mire, turtleRock }, placements, spheres };
};

export { parseOracleSpoiler };
export type { OracleSpoiler, OracleSphere };

/* @layer bridge-wasm @kind logic */
/**
 * The server's answer to `!players`, a CommandResult line such as
 * `2 players of 3 connected :: Team #1: Link (Zelda) Ganon :: Team #2: ...`: a name in
 * parentheses has no client connected, a bare one has at least one. Names may hold spaces,
 * so each known name is matched whole, longest first, and taken out of the line once matched.
 */

const REPLY_PATTERN = /^\d+ players? of \d+ connected\b/;
const TEAM_SPLIT = /\s*:: Team #(\d+): /;

interface RosterName {
  slot: number;
  name: string;
}

const isPlayersReply = (text: string): boolean => REPLY_PATTERN.test(text.trim());

/** The names listed for one team (0-based), or null when the line has no such team. */
const teamSection = (text: string, team: number): string | null => {
  const parts = text.split(TEAM_SPLIT);
  for (let index = 1; index + 1 < parts.length; index += 2) {
    if (Number(parts[index]) === team + 1) return parts[index + 1];
  }
  return null;
};

/** Online or not, per slot, for every known name the line lists; a name it misses is left out. */
const rosterOfReply = (text: string, team: number, names: readonly RosterName[]): Map<number, boolean> => {
  const roster = new Map<number, boolean>();
  const section = teamSection(text.trim(), team);
  if (section === null) return roster;
  let rest = ` ${section} `;
  const longestFirst = [...names].sort((a, b) => b.name.length - a.name.length);
  for (const { slot, name } of longestFirst) {
    for (const [token, online] of [[` (${name}) `, false], [` ${name} `, true]] as const) {
      const at = rest.indexOf(token);
      if (at < 0) continue;
      roster.set(slot, online);
      rest = `${rest.slice(0, at)} ${rest.slice(at + token.length)}`;
      break;
    }
  }
  return roster;
};

export { isPlayersReply, rosterOfReply };
export type { RosterName };

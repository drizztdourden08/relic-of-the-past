/* @layer bridge-wasm @kind logic */
import { TEAM_SPLIT } from './players-reply.constants';
import type { RosterName } from './players-reply.type';

const teamSection = (text: string, team: number): string | null => {
  const parts = text.split(TEAM_SPLIT);
  for (let index = 1; index + 1 < parts.length; index += 2) {
    if (Number(parts[index]) === team + 1) return parts[index + 1];
  }
  return null;
};

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

export { rosterOfReply };

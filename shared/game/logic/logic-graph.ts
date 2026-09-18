/* @layer shared-game @kind logic */
/**
 * The tracker's reachability graph for a vanilla game: the reference randomizer's region graph
 * (vanilla-rules/region-edges.data.ts) turned into this dataset's screens, every real overworld
 * screen inside its region (regions/region-members.data.ts), and each dungeon as one place once
 * its door is passed. The dataset's own connections are not read here: walking between two
 * real screens carries no rule in the data, and an edge without a rule would let a player who
 * reached one screen reach the whole world.
 */
import type { ScreenId } from '../data';
import { all } from '../data';
import type { ReachConnection } from './eval';
import { REGION_MEMBERS } from './regions/region-members.data';
import { REGION_EDGES } from './vanilla-rules/region-edges.data';
import { screenOfName } from './vanilla-rules/screen-names';

/** One node that every room of a dungeon shares. */
const dungeonHub = (dungeonId: string): string => `${dungeonId}:rooms`;

/** The reference's edges, named screens; an edge whose end no screen carries is dropped and named by `unresolvedNames`. */
const regionEdges = (): ReachConnection[] => {
  const edges: ReachConnection[] = [];
  for (const edge of REGION_EDGES) {
    const from = screenOfName(edge.from);
    const to = screenOfName(edge.to);
    if (from === null || to === null) continue;
    edges.push(edge.rule ? { from, to, requirements: edge.rule } : { from, to });
  }
  return edges;
};

const unresolvedNames = (): string[] => {
  const names = new Set<string>();
  for (const edge of REGION_EDGES) for (const name of [edge.from, edge.to]) if (screenOfName(name) === null) names.add(name);
  return [...names];
};

const membershipEdges = (): ReachConnection[] => {
  const edges: ReachConnection[] = [];
  for (const [region, members] of Object.entries(REGION_MEMBERS) as [ScreenId, readonly ScreenId[]][]) {
    for (const member of members) edges.push({ from: region, to: member });
  }
  return edges;
};

const dungeonEdges = (): ReachConnection[] => {
  const edges: ReachConnection[] = [];
  for (const dungeon of all('dungeon')) {
    const hub = dungeonHub(dungeon.id);
    for (const room of dungeon.roomScreenIds) {
      edges.push({ from: room, to: hub });
      edges.push({ from: hub, to: room });
    }
  }
  return edges;
};

/** Fresh objects every call: the resolver's overlays mutate `.requirements` in place. */
const logicConnections = (): ReachConnection[] => [...regionEdges(), ...membershipEdges(), ...dungeonEdges()];

export { logicConnections, unresolvedNames };

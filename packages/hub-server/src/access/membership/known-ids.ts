/* @layer hub-core @kind logic */
import type { Group } from '@rotp/hub-contracts';

const knownIds = (ids: string[], groups: Group[]): string[] => ids.filter((id) => groups.some((group) => group.id === id));

export { knownIds };

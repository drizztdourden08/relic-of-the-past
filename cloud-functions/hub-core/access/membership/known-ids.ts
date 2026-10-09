/* @layer hub-core @kind logic */
import type { Group } from '../../../../shared/hub';

const knownIds = (ids: string[], groups: Group[]): string[] => ids.filter((id) => groups.some((group) => group.id === id));

export { knownIds };

/* @layer shared-game @kind logic */
import { tagIndex } from './tag-index';

const tagKey = (id: string): string | undefined => tagIndex.byId.get(id)?.name;

export { tagKey };

/* @layer renderer-app @kind logic */
import type { EntityKind } from '@rotp/game-data';
import type { InspectorSource } from '@app/views/DataInspector/DataInspector.type';
import { builtSources } from './built-sources';

const peekCollectionSource = (kind: EntityKind): InspectorSource | undefined => builtSources.get(kind);

export { peekCollectionSource };

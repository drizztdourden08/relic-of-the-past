/* @layer renderer-widgets @kind types */
import type { useNavigation } from '../useNavigation';

type ConnectionsPanelProps = Pick<ReturnType<typeof useNavigation>, 'entranceSum' | 'crossings' | 'screenBundle' | 'isIndoors' | 'externalEdges' | 'internalConnections' | 'playerDebug'>;

export type { ConnectionsPanelProps };

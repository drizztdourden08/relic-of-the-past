/* @layer renderer-widgets @kind types */
import type { useNavigation } from '../useNavigation';

type InternalEdgesSectionProps = Pick<ReturnType<typeof useNavigation>, 'internalConnections' | 'screenBundle'>;

export type { InternalEdgesSectionProps };

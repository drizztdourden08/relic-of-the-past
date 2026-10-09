/* @layer renderer-widgets @kind types */
import type { useNavigation } from '../behavior/useNavigation';

type InternalEdgesSectionProps = Pick<ReturnType<typeof useNavigation>, 'internalConnections' | 'screenBundle'>;

export type { InternalEdgesSectionProps };

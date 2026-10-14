/* @layer renderer-widgets @kind types */
import type { useNavigation } from '../behavior/useNavigation';

type LocationSectionProps = Pick<ReturnType<typeof useNavigation>, 'screenBundle' | 'screenName' | 'screenId' | 'isIndoors' | 'roomIndex' | 'isDarkWorld' | 'overworldScreenIndex' | 'externalConnections' | 'renderResults' | 'playerDebug'>;

type LocationNameProps = Pick<LocationSectionProps, 'screenBundle' | 'screenName' | 'isIndoors'>;

export type { LocationNameProps, LocationSectionProps };

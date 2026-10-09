/* @layer renderer-widgets @kind hook */
import { useMemo } from 'react';
import type { ScreenMatchResult } from '@shared/game/logic/queries/detection';
import { screenDataStatus } from '../screen-data-status';
import type { ScreenDataStatusResult } from '../navigation.type';

const useScreenDataStatus = (matchResult: ScreenMatchResult | null, isIndoors: boolean): ScreenDataStatusResult =>
  useMemo(() => screenDataStatus(matchResult, isIndoors), [matchResult, isIndoors]);

export { useScreenDataStatus };

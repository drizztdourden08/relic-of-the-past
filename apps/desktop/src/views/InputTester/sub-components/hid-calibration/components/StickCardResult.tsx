/* @layer renderer-components @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import type { StickCardState } from './StickCards.type';

const StickCardResult = (props: Pick<StickCardState, 'xItem' | 'yItem'>) => {
  const { xItem, yItem } = props;

  return (
    <Text as="p" className="hid-cal__desc hid-cal__stick-result">
      X: {xItem?.result ?? '-'}<Box as="br" />Y: {yItem?.result ?? '-'}
    </Text>
  );
};

export { StickCardResult };

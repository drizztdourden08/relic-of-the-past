/* @layer renderer-components @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { MappingPasteBox } from '../MappingPasteBox';
import { EXPLANATION } from './UnavailableControllerNotice.constants';
import type { UnavailableControllerNoticeProps } from './UnavailableControllerNotice.type';
import './UnavailableControllerNotice.css';

const UnavailableControllerNotice = (props: UnavailableControllerNoticeProps) => {
  const { onAddMapping } = props;
  return (
    <Box className="unavailable-controller-notice">
      <Text as="p" className="unavailable-controller-notice__text">{EXPLANATION}</Text>
      <MappingPasteBox onSubmit={onAddMapping} />
    </Box>
  );
};

export { UnavailableControllerNotice };

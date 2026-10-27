/* @layer website-site @kind component */
import { Box, Span } from '../../../../design';
import { ShotImage } from '../../../ShotImage';
import { useCompareSplit } from './behavior/useCompareSplit';
import type { CompareStageProps } from './CompareStage.type';
import './CompareStage.css';

const CompareStage = ({ before, after, labels, axis }: CompareStageProps) => {
  const { stageRef, handlers } = useCompareSplit(axis);

  return (
    <Box ref={stageRef} className={`compare-stage compare-stage--${axis}`} {...handlers}>
      <ShotImage shot={after} alt={`${labels[1]}: ${after.alt}`} className="compare-stage__after" />
      <ShotImage shot={before} alt={`${labels[0]}: ${before.alt}`} className="compare-stage__before" />
      <Box className="compare-stage__divider" aria-hidden="true" />
      <Span className="compare-stage__label compare-stage__label--before">{labels[0]}</Span>
      <Span className="compare-stage__label compare-stage__label--after">{labels[1]}</Span>
    </Box>
  );
};

export { CompareStage };

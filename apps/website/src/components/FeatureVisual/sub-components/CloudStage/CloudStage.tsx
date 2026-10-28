/* @layer website-site @kind component */
import { useRef } from 'react';
import { Box, Span } from '../../../../design';
import { relocateOnFade } from './behavior/relocate-on-fade';
import { useCloudLayout } from './behavior/useCloudLayout';
import { wordStyleOf } from './behavior/word-style-of';
import type { CloudStageProps } from './CloudStage.type';
import './CloudStage.css';

const CloudStage = ({ words }: CloudStageProps) => {
  const stageRef = useRef<HTMLDivElement>(null);
  const { placements, relocate } = useCloudLayout(stageRef, words);

  return (
    <Box ref={stageRef} className="cloud-stage">
      <Box as="ul" className="cloud-stage__words" onAnimationIteration={(event) => relocateOnFade(event, relocate)}>
        {placements.map((placement) => (
          <Box as="li" key={placement.word} className="cloud-stage__word" data-word={placement.word} data-tone={placement.tone} data-wrapped={placement.wrapped ? '' : undefined} style={wordStyleOf(placement)}>
            <Span>{placement.word}</Span>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export { CloudStage };

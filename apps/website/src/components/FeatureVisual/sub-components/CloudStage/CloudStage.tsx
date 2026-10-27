/* @layer website-site @kind component */
import { Box, Span } from '../../../../design';
import { densityOf } from './behavior/density-of';
import type { CloudStageProps } from './CloudStage.type';
import './CloudStage.css';

const CloudStage = ({ words }: CloudStageProps) => (
  <Box className="cloud-stage">
    <Box as="ul" className="cloud-stage__words" data-density={densityOf(words.length)}>
      {words.map((word) => (
        <Box as="li" key={word} className="cloud-stage__word">
          <Span>{word}</Span>
        </Box>
      ))}
    </Box>
  </Box>
);

export { CloudStage };

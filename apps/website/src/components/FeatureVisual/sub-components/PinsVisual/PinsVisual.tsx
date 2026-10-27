/* @layer website-site @kind component */
import { Box, List, ListItem } from '../../../../design';
import { ShotImage } from '../../../ShotImage';
import { aspectOf } from '../../behavior/aspect-of';
import { Expandable } from '../Expandable';
import { PinMarks } from '../PinMarks';
import { ShotFrame } from '../ShotFrame';
import type { VisualProps } from '../../FeatureVisual.type';
import './PinsVisual.css';

const PinsVisual = ({ visual, caption }: VisualProps<'pins'>) => {
  const { shot, callouts } = visual;
  const stage = (
    <Box className="pins-visual">
      <ShotImage shot={shot} />
      <PinMarks callouts={callouts} />
    </Box>
  );

  return (
    <ShotFrame caption={caption}>
      <Expandable aspect={aspectOf(shot)} label={caption} expanded={stage}>
        {stage}
      </Expandable>
      <List ordered className="pins-visual__legend">
        {callouts.map((callout) => (
          <ListItem key={callout.label} className="pins-visual__item">
            {callout.label}
          </ListItem>
        ))}
      </List>
    </ShotFrame>
  );
};

export { PinsVisual };

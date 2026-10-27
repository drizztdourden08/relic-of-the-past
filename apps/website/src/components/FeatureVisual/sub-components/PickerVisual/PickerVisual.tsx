/* @layer website-site @kind component */
import { useState } from 'react';
import { Box, Pressable, Span } from '../../../../design';
import { ShotImage } from '../../../ShotImage';
import { aspectOf } from '../../behavior/aspect-of';
import { CompareStage } from '../CompareStage';
import { Expandable } from '../Expandable';
import { ShotFrame } from '../ShotFrame';
import { PAIR, THUMB_RATIO } from './PickerVisual.constants';
import type { VisualProps } from '../../FeatureVisual.type';
import './PickerVisual.css';

const PickerVisual = ({ visual, caption }: VisualProps<'picker'>) => {
  const { options, labels, axis, focus } = visual;
  const [pickedId, setPickedId] = useState(options[0].id);
  const picked = options.find((option) => option.id === pickedId) ?? options[0];
  const stage = <CompareStage before={picked.before} after={picked.after} labels={labels} axis={axis} />;

  return (
    <ShotFrame caption={caption} framed={false}>
      <Expandable aspect={aspectOf(picked.before)} label={caption} expanded={stage}>
        {stage}
      </Expandable>
      <Box
        className={options.length > PAIR ? 'picker-visual__options picker-visual__options--many' : 'picker-visual__options'}
        role="group"
        aria-label={`${labels[1]} variations`}
      >
        {options.map((option) => (
          <Pressable
            key={option.id}
            className={`picker-visual__option picker-visual__option--${focus}`}
            aria-pressed={option.id === picked.id}
            onClick={() => setPickedId(option.id)}
          >
            <ShotImage shot={option.after} alt="" ratio={THUMB_RATIO} className="picker-visual__thumb" />
            <Span className="picker-visual__name">{option.name}</Span>
          </Pressable>
        ))}
      </Box>
    </ShotFrame>
  );
};

export { PickerVisual };

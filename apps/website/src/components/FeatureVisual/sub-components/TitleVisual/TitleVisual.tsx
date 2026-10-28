/* @layer website-site @kind component */
import { useState } from 'react';
import { Box, Pressable, Span } from '../../../../design';
import { ShotImage } from '../../../ShotImage';
import { aspectOf } from '../../behavior/aspect-of';
import { ClipPlayer } from '../ClipPlayer';
import { Expandable } from '../Expandable';
import { ShotFrame } from '../ShotFrame';
import { THUMB_RATIO } from './TitleVisual.constants';
import type { VisualProps } from '../../FeatureVisual.type';
import './TitleVisual.css';

const TitleVisual = ({ visual, caption }: VisualProps<'title'>) => {
  const { variants } = visual;
  const [pickedId, setPickedId] = useState(variants[0].id);
  const picked = variants.find((variant) => variant.id === pickedId) ?? variants[0];

  return (
    <ShotFrame caption={caption} framed={false}>
      <Box className="title-visual">
        <Expandable
          aspect={aspectOf(picked.video.poster)}
          label={caption}
          expanded={<ClipPlayer clip={picked.video} />}
          className="title-visual__screen"
        >
          <ClipPlayer clip={picked.video} />
        </Expandable>
        <Box className="title-visual__variants" role="group" aria-label={caption}>
          {variants.map((variant) => (
            <Pressable
              key={variant.id}
              className="title-visual__variant"
              aria-pressed={variant.id === picked.id}
              onClick={() => setPickedId(variant.id)}
            >
              <ShotImage shot={variant.thumb} alt="" ratio={THUMB_RATIO} className="title-visual__thumb" />
              <Span className="title-visual__name">{variant.name}</Span>
            </Pressable>
          ))}
        </Box>
      </Box>
    </ShotFrame>
  );
};

export { TitleVisual };

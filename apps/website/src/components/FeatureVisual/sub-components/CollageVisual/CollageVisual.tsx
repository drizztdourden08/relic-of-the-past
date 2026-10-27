/* @layer website-site @kind component */
import { useState } from 'react';
import { Box, Lightbox } from '../../../../design';
import type { CollageLayer } from '../../../../features';
import { ShotImage } from '../../../ShotImage';
import { activatableProps } from '../../behavior/activatable-props';
import { aspectOf } from '../../behavior/aspect-of';
import { PinMarks } from '../PinMarks';
import { ShotFrame } from '../ShotFrame';
import { useCollageArrangement } from './behavior/useCollageArrangement';
import { COLLAGE_TEXT } from './CollageVisual.constants';
import type { VisualProps } from '../../FeatureVisual.type';
import './CollageVisual.css';

const CollageVisual = ({ visual, caption }: VisualProps<'collage'>) => {
  const { layers } = visual;
  const { arrangement, promote } = useCollageArrangement(layers);
  const [open, setOpen] = useState(false);
  const depthOf = new Map(layers.map((layer) => [layer.slot, layer.depth]));
  const main = layers[Math.max(arrangement.slots.indexOf('main'), 0)] ?? layers[0];
  const picture = (layer: CollageLayer) => (
    <>
      <ShotImage shot={layer.shot} className="collage-visual__shot" />
      {layer.callouts ? <PinMarks callouts={layer.callouts} /> : null}
    </>
  );

  return (
    <ShotFrame caption={caption} framed={false}>
      <Box className="collage-visual">
        {layers.map((layer, index) => {
          const slot = arrangement.slots[index] ?? 'main';
          const isMain = slot === 'main';
          const activate = isMain ? () => setOpen(true) : () => promote(index);
          const label = isMain ? COLLAGE_TEXT.expand(layer.shot.alt) : COLLAGE_TEXT.promote(layer.shot.alt);
          const press = activatableProps(activate, label);
          return (
            <Box
              key={layer.shot.id}
              className={`depth depth--${depthOf.get(slot) ?? 'mid'} collage-visual__layer collage-visual__layer--${slot}`}
            >
              <Box
                {...press}
                aria-haspopup={isMain ? 'dialog' : undefined}
                className={isMain ? 'collage-visual__press collage-visual__press--main' : 'collage-visual__press'}
                data-flip={arrangement.flips[index]}
                onClick={(event) => {
                  event.currentTarget.focus({ preventScroll: true });
                  press.onClick?.(event);
                }}
              >
                {picture(layer)}
              </Box>
            </Box>
          );
        })}
      </Box>
      <Lightbox open={open} onClose={() => setOpen(false)} label={main.shot.alt} aspect={aspectOf(main.shot)}>
        <Box className="collage-visual__expanded">{picture(main)}</Box>
      </Lightbox>
    </ShotFrame>
  );
};

export { CollageVisual };

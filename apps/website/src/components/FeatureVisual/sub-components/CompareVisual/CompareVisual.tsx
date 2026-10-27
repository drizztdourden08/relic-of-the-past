/* @layer website-site @kind component */
import { Box, Span } from '../../../../design';
import { DepthLayer } from '../../../DepthLayer';
import { ShotImage } from '../../../ShotImage';
import { ShotFrame } from '../ShotFrame';
import type { VisualProps } from '../../FeatureVisual.type';
import './CompareVisual.css';

const CompareVisual = ({ visual, caption }: VisualProps<'compare'>) => {
  const { before, after, labels, axis, insets = [] } = visual;
  const insetClass = insets.length > 1 ? 'compare-visual__insets compare-visual__insets--many' : 'compare-visual__insets';

  return (
    <ShotFrame caption={caption} framed={false}>
      <Box className={`compare-visual compare-visual--${axis}`}>
        <Box className="compare-visual__stage">
          <ShotImage shot={after} alt={`${labels[1]}: ${after.alt}`} className="compare-visual__after" />
          <ShotImage shot={before} alt={`${labels[0]}: ${before.alt}`} className="compare-visual__before" />
          <Box className="compare-visual__divider" aria-hidden="true" />
          <Span className="compare-visual__label compare-visual__label--before">{labels[0]}</Span>
          <Span className="compare-visual__label compare-visual__label--after">{labels[1]}</Span>
        </Box>
        {insets.length > 0 ? (
          <DepthLayer depth="front" className={insetClass}>
            {insets.map((shot) => (
              <ShotImage key={shot.id} shot={shot} className="compare-visual__inset" />
            ))}
          </DepthLayer>
        ) : null}
      </Box>
    </ShotFrame>
  );
};

export { CompareVisual };

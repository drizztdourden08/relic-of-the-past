/* @layer website-site @kind component */
import { Box } from '../../../../design';
import { readyVisualOf } from '../../../../features';
import { FeatureVisual } from '../../../FeatureVisual';
import { FeatureCopy } from '../FeatureCopy';
import type { FeatureRowProps } from './FeatureRow.type';
import './FeatureRow.css';

const FeatureRow = ({ feature, figure }: FeatureRowProps) => {
  const visual = readyVisualOf(feature.visual);
  const layout = visual ? feature.layout : 'bare';

  return (
    <Box as="article" id={feature.id} aria-labelledby={`${feature.id}-title`} className={`feature-row feature-row--${layout}`}>
      <FeatureCopy feature={feature} figure={figure} />
      {visual ? <FeatureVisual visual={visual} caption={`${figure} · ${feature.caption}`} /> : null}
    </Box>
  );
};

export { FeatureRow };

/* @layer website-site @kind component */
import { Box, Svg, SvgPath } from '../../../../design';
import { TRIFORCE_PATHS, TRIFORCE_VIEW_BOX } from './CommunityTexture.constants';
import { useTriforceStyles } from './behavior/useTriforceStyles';
import './CommunityTexture.css';

const CommunityTexture = () => {
  const triforces = useTriforceStyles();

  return (
    <Box className="landing-texture" aria-hidden="true">
      {triforces.map((entry) => (
        <Svg key={entry.key} className="landing-texture__triforce" style={entry.style} viewBox={TRIFORCE_VIEW_BOX}>
          {TRIFORCE_PATHS.map((path) => (
            <SvgPath key={path} d={path} />
          ))}
        </Svg>
      ))}
    </Box>
  );
};

export { CommunityTexture };

/* @layer renderer-app @kind component */
import { Box } from '../../../../../../design-system/primitives';
import { COLOR_GROUPS } from '../../DesignGallery.constants';
import { Swatch } from '../Swatch';
import { Specimen } from '../Specimen';

/** Foundations › color roles & surfaces. */
const ColorStory = () => (
  <Box className="dg-stack">
    {COLOR_GROUPS.map(group => (
      <Specimen key={group.title} label={group.title} hint={group.description}>
        <Box className="dg-swatch-grid">
          {group.tokens.map(t => <Swatch key={t.cssVar} token={t} />)}
        </Box>
      </Specimen>
    ))}
  </Box>
);

export { ColorStory };

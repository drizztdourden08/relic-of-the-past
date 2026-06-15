/* @layer renderer-app @kind component */
import { Box, Button, SectionHeader, StatRow, ButtonRow, Thumbnail, ProgressRing, Icon } from '../../../../../../design-system/primitives';
import { Specimen } from '../Specimen';

const CHECK_PATH = ['M3.5 8.5 l3 3 l6 -7'];

/** Components › data display & headers. */
const DataStory = () => (
  <Box className="dg-stack">
    <Specimen label="SectionHeader" hint="title + subtitle + action slot">
      <SectionHeader title="Graphics" subtitle="Display & rendering" action={<Button variant="tertiary" size="sm">Reset</Button>} />
    </Specimen>

    <Specimen label="StatRow" hint="label / value (mono optional)">
      <Box>
        <StatRow label="Reachable" value="142 / 216" />
        <StatRow label="Room" value="0x0127" mono />
        <StatRow label="World" value="Light" />
      </Box>
    </Specimen>

    <Specimen label="ButtonRow" hint="footer action group (right-aligned)">
      <ButtonRow>
        <Button variant="tertiary">Cancel</Button>
        <Button variant="primary">Save</Button>
      </ButtonRow>
    </Specimen>

    <Specimen label="Thumbnail" hint="image frame with placeholder fallback">
      <Box className="dg-row">
        <Thumbnail placeholder="No screenshot" />
        <Thumbnail src="./logos/logo-512.png" alt="logo" />
      </Box>
    </Specimen>

    <Specimen label="ProgressRing" hint="circular progress 0..1">
      <Box className="dg-row">
        <ProgressRing progress={0.25} />
        <ProgressRing progress={0.6} />
        <ProgressRing progress={1} />
      </Box>
    </Specimen>

    <Specimen label="Icon" hint="path-based SVG glyph">
      <Box className="dg-row">
        <Icon paths={CHECK_PATH} size={16} />
        <Icon paths={CHECK_PATH} size={24} />
        <Icon paths={CHECK_PATH} size={32} />
      </Box>
    </Specimen>
  </Box>
);

export { DataStory };

/* @layer renderer-app @kind component */
import { Box, IconButton, Badge, StatusBadge } from '../../../../../../design-system/primitives';
import { Specimen } from '../Specimen';

/** Components › buttons, icon buttons, badges. Demonstrates the gold/green rule. */
const ButtonStory = () => (
  <Box className="dg-stack">
    <Specimen label="Buttons" hint="Gold = primary / CTA. Green = positive-go ONLY (Start, Connect, Resume). Plain utilities are secondary-neutral.">
      <Box className="dg-row">
        <Box as="button" className="dg-btn dg-btn--primary">Primary</Box>
        <Box as="button" className="dg-btn">Secondary</Box>
        <Box as="button" className="dg-btn dg-btn--ghost">Ghost</Box>
        <Box as="button" className="dg-btn dg-btn--positive">Start ▸</Box>
        <Box as="button" className="dg-btn dg-btn--danger">Delete</Box>
        <Box as="button" className="dg-btn" disabled>Disabled</Box>
      </Box>
    </Specimen>

    <Specimen label="IconButton" hint="ghost / danger">
      <Box className="dg-row">
        <IconButton label="Close" variant="ghost">✕</IconButton>
        <IconButton label="Remove" variant="danger">🗑</IconButton>
      </Box>
    </Specimen>

    <Specimen label="Badge" hint="success / warning / danger / neutral">
      <Box className="dg-row">
        <Badge variant="success">success</Badge>
        <Badge variant="warning">warning</Badge>
        <Badge variant="danger">danger</Badge>
        <Badge variant="neutral">neutral</Badge>
      </Box>
    </Specimen>

    <Specimen label="StatusBadge" hint="draft / mapped / verified — click to cycle">
      <Box className="dg-row">
        <StatusBadge status="draft" />
        <StatusBadge status="mapped" />
        <StatusBadge status="verified" />
      </Box>
    </Specimen>
  </Box>
);

export { ButtonStory };

/* @layer renderer-app @kind component */
import { Box, Button, IconButton, Badge, StatusBadge } from '../../../../../../design-system/primitives';
import { Specimen } from '../Specimen';

/** Components: buttons, icon buttons, badges. */
const ButtonStory = () => (
  <Box className="dg-stack">
    <Specimen label="Button tiers" hint="gold primary · green secondary · grey tertiary · ghost · danger. Primary & secondary sit next to each other">
      <Box className="dg-row">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="tertiary">Tertiary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="danger">Delete</Button>
        <Button variant="primary" disabled>Disabled</Button>
      </Box>
    </Specimen>

    <Specimen label="Button sizes">
      <Box className="dg-row">
        <Button variant="primary" size="sm">Small</Button>
        <Button variant="primary" size="md">Medium</Button>
        <Button variant="secondary" icon="▶">With icon</Button>
      </Box>
    </Specimen>

    <Specimen label="IconButton" hint="same tiers as Button, square">
      <Box className="dg-row">
        <IconButton label="primary" variant="primary">★</IconButton>
        <IconButton label="secondary" variant="secondary">✓</IconButton>
        <IconButton label="tertiary" variant="tertiary">⚙</IconButton>
        <IconButton label="ghost" variant="ghost">✕</IconButton>
        <IconButton label="danger" variant="danger">🗑</IconButton>
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

    <Specimen label="StatusBadge" hint="draft / mapped / verified. Click to cycle">
      <Box className="dg-row">
        <StatusBadge status="draft" />
        <StatusBadge status="mapped" />
        <StatusBadge status="verified" />
      </Box>
    </Specimen>
  </Box>
);

export { ButtonStory };

/* @layer renderer-app @kind component */
import { Box, Text, Card } from '../../../../../../design-system/primitives';
import { Specimen } from '../Specimen';

/** Components › containers: cards, selected state, glass panel. */
const ContainerStory = () => (
  <Box className="dg-stack">
    <Specimen label="Card" hint="default / interactive / danger">
      <Box className="dg-row dg-row--cards">
        <Card>
          <Text className="dg-card__title">Default</Text>
          <Text className="dg-card__body">surface · border · radius-lg</Text>
        </Card>
        <Card variant="interactive">
          <Text className="dg-card__title">Interactive</Text>
          <Text className="dg-card__body">hover lifts to border-strong</Text>
        </Card>
        <Card variant="danger">
          <Text className="dg-card__title">Danger</Text>
          <Text className="dg-card__body">destructive zone</Text>
        </Card>
      </Box>
    </Specimen>

    <Specimen label="Selected vs glass" hint="selected = gold fill; glass = floating-over-game panel + the one blur">
      <Box className="dg-row dg-row--cards">
        <Box className="dg-card dg-card--selected">
          <Text className="dg-card__title">Selected</Text>
          <Text className="dg-card__body">gold border + gold-soft fill</Text>
        </Box>
        <Box className="dg-glass">
          <Text className="dg-card__title">Glass panel</Text>
          <Text className="dg-card__body">glass surface + blur(8)</Text>
        </Box>
      </Box>
    </Specimen>
  </Box>
);

export { ContainerStory };

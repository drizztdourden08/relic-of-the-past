/* @layer renderer-components @kind component */
import { Box, Button, Image, Text } from '@drizztdourden08/tessera/primitives';
import { DateText } from '@drizztdourden08/tessera/composites';
import type { HeroLastSave } from '../ProfileHero.type';

const HeroLastSaveTile = (props: { save: HeroLastSave }) => {
  const { save } = props;
  return (
    <Box className="profile-hero__save">
      <Image
        frame
        src={save.screenshotUrl ?? undefined}
        alt={save.name}
        className="profile-hero__save-thumb"
        fallback={<Text className="profile-hero__save-empty">No screenshot</Text>}
      />
      <Box className="profile-hero__save-body">
        <Box className="profile-hero__save-text">
          <Text className="hero__eyebrow">Last save</Text>
          <Text className="profile-hero__save-name" title={save.name}>{save.name}</Text>
          <Text className="profile-hero__save-time"><DateText value={save.timestamp} format="calendar" /></Text>
        </Box>
        <Button variant="tertiary" size="sm" onClick={save.onLoad} disabled={save.busy}>
          Load
        </Button>
      </Box>
    </Box>
  );
};

export { HeroLastSaveTile };

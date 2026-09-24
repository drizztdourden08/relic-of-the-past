/* @layer renderer-components @kind component */
/** Floating glass tile on the hero's right: the last save's screenshot, name and load. */
import { Box } from '../../../../../design-system/primitives/Box';
import { Button } from '../../../../../design-system/primitives/Button';
import { Text } from '../../../../../design-system/primitives/Text';
import { Thumbnail } from '../../../../../design-system/primitives/Thumbnail';
import type { HeroLastSave } from '../ProfileHero.type';

const formatSaveTime = (timestamp: number): string => new Date(timestamp).toLocaleString(undefined, {
  weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
});

const HeroLastSaveTile = (props: { save: HeroLastSave }) => {
  const { save } = props;
  return (
    <Box className="profile-hero__glass profile-hero__save">
      <Thumbnail
        src={save.screenshotUrl}
        alt={save.name}
        className="profile-hero__save-thumb"
        placeholder={<Text className="profile-hero__save-empty">No screenshot</Text>}
      />
      <Box className="profile-hero__save-body">
        <Box className="profile-hero__save-text">
          <Text className="profile-hero__eyebrow">Last save</Text>
          <Text className="profile-hero__save-name" title={save.name}>{save.name}</Text>
          <Text className="profile-hero__save-time">{formatSaveTime(save.timestamp)}</Text>
        </Box>
        <Button variant="tertiary" size="sm" onClick={save.onLoad} disabled={save.busy}>
          Load
        </Button>
      </Box>
    </Box>
  );
};

export { HeroLastSaveTile };

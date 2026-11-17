/* @layer renderer-components @kind component */
import { Box, Icon, Inline, List, ListItem, Stack, Text } from '@drizztdourden08/tessera/primitives';
import type { OfficialRomListProps } from './OfficialRomList.type';
import './OfficialRomList.css';

const OfficialRomList = ({ roms }: OfficialRomListProps) => (
  <Stack gap="xs" className="official-roms">
    <Text className="official-roms__title">Official ROMs</Text>
    <List className="official-roms__list">
      {roms.map((rom) => (
        <ListItem key={rom.sha1} bare className="official-roms__row" data-supported={rom.supported}>
          <Inline gap="sm" align="baseline">
            <Box className="official-roms__mark">{rom.supported && <Icon name="check" label="Supported" />}</Box>
            <Text className="official-roms__name">{rom.name}</Text>
          </Inline>
        </ListItem>
      ))}
    </List>
  </Stack>
);

export { OfficialRomList };

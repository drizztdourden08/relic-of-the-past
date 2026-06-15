/* @layer renderer-app @kind component */
import { Box, Text, Flex, Grid, Stack, Center, Spacer, Divider } from '../../../../../../design-system/primitives';
import { Specimen } from '../Specimen';

/** Components › layout primitives. */
const LayoutStory = () => (
  <Box className="dg-stack">
    <Specimen label="Flex" hint="direction / gap / align / justify">
      <Flex gap="sm">
        <Box className="dg-cell">1</Box>
        <Box className="dg-cell">2</Box>
        <Box className="dg-cell">3</Box>
      </Flex>
    </Specimen>

    <Specimen label="Grid" hint="auto-fill minColWidth">
      <Grid minColWidth={80} gap="sm">
        <Box className="dg-cell">a</Box>
        <Box className="dg-cell">b</Box>
        <Box className="dg-cell">c</Box>
        <Box className="dg-cell">d</Box>
        <Box className="dg-cell">e</Box>
      </Grid>
    </Specimen>

    <Specimen label="Stack" hint="vertical, gap md">
      <Stack gap="sm">
        <Box className="dg-cell">top</Box>
        <Box className="dg-cell">middle</Box>
        <Box className="dg-cell">bottom</Box>
      </Stack>
    </Specimen>

    <Specimen label="Center">
      <Center className="dg-center-demo"><Box className="dg-cell">centered</Box></Center>
    </Specimen>

    <Specimen label="Spacer" hint="flexible filler pushes siblings apart">
      <Flex gap="sm">
        <Box className="dg-cell">left</Box>
        <Spacer />
        <Box className="dg-cell">right</Box>
      </Flex>
    </Specimen>

    <Specimen label="Divider">
      <Box>
        <Text>Above</Text>
        <Divider />
        <Text>Below</Text>
      </Box>
    </Specimen>
  </Box>
);

export { LayoutStory };

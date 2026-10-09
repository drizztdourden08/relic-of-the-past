/* @layer store-site @kind component */
import { Box, Button, Field, Flex, Stack, Text, Textarea } from '@drizztdourden08/tessera/primitives';
import { SettingsSection } from '@drizztdourden08/tessera/composites';
import { Markdown } from '../../../components/Markdown/Markdown';
import { useStoreData } from '../../../data/store-data-context';
import { useHomeSettings } from '../behavior/useHomeSettings';
import { FeaturedOrder } from './FeaturedOrder';

const HomePageSection = () => {
  const settings = useHomeSettings();
  const { catalog } = useStoreData();
  return (
    <Stack as="section" gap="lg" align="stretch" data-section="home-page">
      <Text as="h3" className="administration__heading">Home page</Text>
      {settings.notice && <Text as="p" variant="caption" role="status">{settings.notice}</Text>}
      <Box>
        <SettingsSection title="Welcome message" description="Shown under the greeting at the top of the home page, to every player.">
          <Field label="Message" hint="Markdown: **bold**, lists and links work." htmlFor="welcome-text">
            <Textarea id="welcome-text" rows={6} value={settings.welcome} onChange={(event) => settings.setWelcome(event.target.value)} />
          </Field>
          {settings.welcome.trim() && (
            <Stack gap="xs" align="stretch" className="administration__preview">
              <Text as="span" variant="caption">Preview</Text>
              <Markdown source={settings.welcome} />
            </Stack>
          )}
          <Flex justify="end">
            <Button variant="primary" size="sm" disabled={settings.busy} onClick={() => void settings.saveWelcome()}>Save the message</Button>
          </Flex>
        </SettingsSection>
      </Box>
      <Box>
        <SettingsSection title="Featured" description="The items the home page opens on, first to last. Their banners show when they have one.">
          <FeaturedOrder settings={settings} catalog={catalog.items} />
        </SettingsSection>
      </Box>
    </Stack>
  );
};

export { HomePageSection };

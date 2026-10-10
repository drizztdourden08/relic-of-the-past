/* @layer store-site @kind component */
import { Stack } from '@drizztdourden08/tessera/primitives';
import { SettingsPage } from '@drizztdourden08/tessera/composites';
import { useSectionHeading } from '@rotp/design';
import { ANCHORS } from './Administration.constants';
import { HomePageSection } from './sub-components/HomePageSection';
import './Administration.css';

const Administration = () => {
  const heading = useSectionHeading('admin');
  return (
    <SettingsPage icon={heading.icon} title={heading.title} anchors={ANCHORS}>
      <Stack gap="xl" align="stretch" className="administration">
        <HomePageSection />
      </Stack>
    </SettingsPage>
  );
};

export { Administration };

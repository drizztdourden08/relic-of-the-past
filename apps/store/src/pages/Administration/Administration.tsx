/* @layer store-site @kind component */
import { Stack } from '@drizztdourden08/tessera/primitives';
import { SitePage } from '@rotp/design';
import { ANCHORS } from './Administration.constants';
import { HomePageSection } from './sub-components/HomePageSection';
import './Administration.css';

const Administration = () => (
  <SitePage section="admin" anchors={ANCHORS}>
    <Stack gap="xl" align="stretch" className="administration">
      <HomePageSection />
    </Stack>
  </SitePage>
);

export { Administration };

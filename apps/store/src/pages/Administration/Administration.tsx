/* @layer store-site @kind component */
import { Stack } from '@ds/primitives/Stack';
import { SitePage } from '@site-kit/layout/SitePage/SitePage';
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

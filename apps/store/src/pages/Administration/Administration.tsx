/* @layer store-site @kind component */
/**
 * Administration, for the feature permission: the store's settings, one section each,
 * reached from the anchors in the header. Home page (the welcome message and the featured
 * row) is its first section.
 */
import { Stack } from '@ds/primitives/Stack';
import { SitePage } from '@site-kit/layout/SitePage/SitePage';
import { HomePageSection } from './sub-components/HomePageSection';
import './Administration.css';

const ANCHORS = [{ id: 'home-page', label: 'Home page' }];

const Administration = () => (
  <SitePage section="admin" anchors={ANCHORS}>
    <Stack gap="xl" align="stretch" className="administration">
      <HomePageSection />
    </Stack>
  </SitePage>
);

export { Administration };

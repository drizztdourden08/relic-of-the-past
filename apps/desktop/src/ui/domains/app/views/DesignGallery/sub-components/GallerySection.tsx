/* @layer renderer-app @kind component */
import type { ReactNode } from 'react';
import { Box, Text } from '../../../../../design-system/primitives';

/** A titled section of the gallery: heading + optional blurb + content. */
const GallerySection = ({ title, description, children }: { title: string; description?: string; children: ReactNode }) => (
  <Box as="section" className="dg-section">
    <Text as="h2" className="dg-section__title">{title}</Text>
    {description && <Text as="p" className="dg-section__desc">{description}</Text>}
    {children}
  </Box>
);

export { GallerySection };

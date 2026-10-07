/* @layer renderer-appshell @kind data */
/**
 * The pages that are one full-screen layer with a title around a view that takes no props.
 * The router looks a page up here, so adding one of these is one entry.
 */
import type { ReactNode } from 'react';
import { InputCalibration } from '../ui/domains/app/views/InputTester';
import { CreditsPage } from '../ui/domains/app/views/ProfileHub/sub-components/CreditsTab';
import { DesignGallery } from '../ui/domains/app/views/DesignGallery';
import { DataInspector } from '../ui/domains/app/views/DataInspector';
import { About } from '../ui/domains/app/views/About';
import type { PageId } from './types';

type SimplePage = { title: string; render: () => ReactNode };

const SIMPLE_PAGES: Partial<Record<PageId, SimplePage>> = {
  'input-tester': { title: 'Input Calibration', render: () => <InputCalibration /> },
  credits: { title: 'Credits', render: () => <CreditsPage /> },
  'design-gallery': { title: 'Design Gallery', render: () => <DesignGallery /> },
  'data-inspector': { title: 'Data Inspector', render: () => <DataInspector /> },
  about: { title: 'About', render: () => <About /> },
};

export { SIMPLE_PAGES };
export type { SimplePage };

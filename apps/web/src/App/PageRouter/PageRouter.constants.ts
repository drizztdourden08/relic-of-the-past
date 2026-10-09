/* @layer renderer-appshell @kind constants */
import { InputCalibration } from '../../ui/domains/app/views/InputTester';
import { CreditsPage } from '../../ui/domains/app/views/ProfileHub/sub-components/CreditsTab';
import { DesignGallery } from '../../ui/domains/app/views/DesignGallery';
import { DataInspector } from '../../ui/domains/app/views/DataInspector';
import { About } from '../../ui/domains/app/views/About';
import type { PageId } from '../App.type';
import type { TitledPage } from './PageRouter.type';

const TITLED_PAGES: Partial<Record<PageId, TitledPage>> = {
  'input-tester': { title: 'Input Calibration', View: InputCalibration },
  credits: { title: 'Credits', View: CreditsPage },
  'design-gallery': { title: 'Design Gallery', View: DesignGallery },
  'data-inspector': { title: 'Data Inspector', View: DataInspector },
  about: { title: 'About', View: About },
};

export { TITLED_PAGES };

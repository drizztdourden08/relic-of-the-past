/* @layer website-site @kind component */
import { Flex, Title } from '@drizztdourden08/tessera/primitives';
import { DownloadButton } from '../DownloadButton';
import { CLOSING_TEXT } from './ClosingCta.constants';
import './ClosingCta.css';

const ClosingCta = () => (
  <Flex as="section" direction="column" align="center" className="closing-cta">
    <Title level={2} tone="primary" className="closing-cta__title">
      {CLOSING_TEXT.title}
    </Title>
    <DownloadButton />
  </Flex>
);

export { ClosingCta };

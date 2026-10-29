/* @layer site-kit @kind component */
import { Link, Text } from '@drizztdourden08/tessera/primitives';
import { AGE_NOTICE_TEXT, TERMS_LABEL, TERMS_URL } from './SignIn.constants';
import './AgeNotice.css';

const AgeNotice = () => (
  <Text as="p" variant="caption" tone="warning" className="age-notice">
    {AGE_NOTICE_TEXT}{' '}
    <Link href={TERMS_URL} external tone="neutral">{TERMS_LABEL}</Link>
  </Text>
);

export { AgeNotice };

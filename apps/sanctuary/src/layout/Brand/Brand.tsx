/* @layer sanctuary-site @kind component */
/** The logo and the wordmark, set in the game's own face; a link back to the files. */
import { Image } from '@ds/primitives/Image';
import { Text } from '@ds/primitives/Text';
import { Link } from '../../router/Link';
import './Brand.css';

const LOGO_SRC = '/logo-128.png';

const Brand = () => (
  <Link to="/" className="brand" aria-label="Sanctuary, files">
    <Image className="brand__logo" src={LOGO_SRC} alt="" />
    <Text as="span" className="brand__wordmark">Sanctuary</Text>
  </Link>
);

export { Brand };

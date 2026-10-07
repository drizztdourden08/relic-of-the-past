/* @layer sanctuary-site @kind component */
/**
 * The logo and the wordmark, set in the game's own face; a link back to the files.
 * `bar` sits in the member pages' top band, logo beside the word. `hero` heads the
 * pages with no nav (sign-in, waiting, device): a large logo with the word under it.
 */
import { Image } from '@ds/primitives/Image';
import { Text } from '@ds/primitives/Text';
import { Link } from '../../router/Link';
import './Brand.css';

const LOGO_SRC = '/logo-128.png';

type BrandProps = {
  size?: 'bar' | 'hero';
};

const Brand = (props: BrandProps) => {
  const { size = 'bar' } = props;
  return (
    <Link to="/" className={`brand brand--${size}`} aria-label="Sanctuary, files">
      <Image className="brand__logo" src={LOGO_SRC} alt="" />
      <Text as="span" className="brand__wordmark">Sanctuary</Text>
    </Link>
  );
};

export { Brand };
export type { BrandProps };

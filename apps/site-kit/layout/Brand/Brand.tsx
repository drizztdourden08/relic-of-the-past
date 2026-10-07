/* @layer site-kit @kind component */
/**
 * The site's logo and wordmark, set in the game's own face; a link back home.
 * `bar` sits in the member pages' top band, logo beside the word. `hero` heads the
 * pages with no nav (sign-in, waiting, device): a large logo with the word under it.
 */
import { Image } from '@ds/primitives/Image';
import { Text } from '@ds/primitives/Text';
import { Link } from '../../router/Link';
import { useSiteDefinition } from '../../site/site-context';
import './Brand.css';

type BrandProps = {
  size?: 'bar' | 'hero';
};

const Brand = (props: BrandProps) => {
  const { size = 'bar' } = props;
  const { brand } = useSiteDefinition();
  return (
    <Link to="/" className={`brand brand--${size}`} aria-label={brand.homeLabel}>
      <Image className="brand__logo" src={brand.logo} alt="" />
      <Text as="span" className="brand__wordmark">{brand.wordmark}</Text>
    </Link>
  );
};

export { Brand };
export type { BrandProps };

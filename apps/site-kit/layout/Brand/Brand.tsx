/* @layer site-kit @kind component */
import { Image, Text } from '@drizztdourden08/tessera/primitives';
import { Link } from '../../router/Link';
import { useSiteDefinition } from '../../site/site-context';
import type { BrandProps } from './Brand.type';
import './Brand.css';

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

/* @layer renderer-components @kind logic */
import type { LegendSwatchProps } from '../sub-components/LegendSwatch.type';
import type { SwatchLook } from './swatch-look.type';

const swatchLook = ({ color, ring, halo }: LegendSwatchProps): SwatchLook => {
  if (ring) return { className: 'nav-legend__swatch nav-legend__swatch--ring', style: { borderColor: color } };
  if (halo) return { className: 'nav-legend__swatch nav-legend__swatch--halo', style: { background: color, borderColor: halo } };
  return { className: 'nav-legend__swatch', style: { background: color } };
};

export { swatchLook };

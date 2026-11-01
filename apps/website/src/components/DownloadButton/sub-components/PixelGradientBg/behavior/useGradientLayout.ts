/* @layer website-site @kind hook */
import { useMemo } from 'react';
import type { GradientLayout } from '../PixelGradientBg.type';
import { layoutGradient } from './layout-gradient';

const useGradientLayout = (): GradientLayout => useMemo(layoutGradient, []);

export { useGradientLayout };

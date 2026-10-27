/* @layer website-site @kind types */
import type { CSSProperties, ImgHTMLAttributes } from 'react';

type ImageFit = 'cover' | 'contain' | 'fill' | 'none';
type ImageStatus = 'loading' | 'loaded' | 'broken';

type ImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'style'> & {
  aspectRatio?: string;
  fit?: ImageFit;
  pixelated?: boolean;
  style?: CSSProperties;
};

type FrameStyleParams = {
  aspectRatio?: string;
  width?: number | string;
  height?: number | string;
  naturalRatio?: string;
  style?: CSSProperties;
};

export type { FrameStyleParams, ImageFit, ImageProps, ImageStatus };

/* @layer website-site @kind types */
import type { SVGProps } from 'react';

type IconName = 'download' | 'github' | 'star' | 'git-fork' | 'circle-dot' | 'external-link';

type IconShape = {
  paths: readonly string[];
  circles?: readonly { cx: number; cy: number; r: number }[];
};

type IconProps = Omit<SVGProps<SVGSVGElement>, 'name'> & {
  name: IconName;
  size?: number | string;
  label?: string;
};

export type { IconName, IconProps, IconShape };

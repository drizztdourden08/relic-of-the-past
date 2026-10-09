/* @layer renderer-components @kind logic */
import type { IconifyIcon } from '@iconify/types';

const kSvgNamespace = 'http://www.w3.org/2000/svg';
const kDefaultSide = 24;

const svgForIcon = (icon: IconifyIcon, size: number): SVGSVGElement => {
  const svg = document.createElementNS(kSvgNamespace, 'svg');
  const width = icon.width ?? kDefaultSide;
  const height = icon.height ?? kDefaultSide;

  svg.setAttribute('viewBox', `${icon.left ?? 0} ${icon.top ?? 0} ${width} ${height}`);
  svg.setAttribute('width', String(size));
  svg.setAttribute('height', String(size));
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('aria-hidden', 'true');
  svg.innerHTML = icon.body;

  return svg;
};

export { svgForIcon };

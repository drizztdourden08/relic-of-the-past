/* @layer renderer-components @kind logic */
/**
 * One icon as a bare SVG element.
 *
 * Everything else in this folder draws its icons through the React component, and
 * should. This exists for the one place that cannot: the markers the editor
 * itself draws at the end of a line are built as plain DOM by the document view,
 * outside React's tree entirely, so they need the icon as an element rather than
 * as an element type.
 *
 * The icon data is the same bundled offline icon every other surface uses, so a
 * marker and its legend row can never end up as two different symbols.
 */
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
  // Bundled icon data, not anything a translator can author.
  svg.innerHTML = icon.body;

  return svg;
};

export { svgForIcon };

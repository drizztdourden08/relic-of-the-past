/* @layer renderer-hud @kind logic */
const outlineFilter = (s: number): string => {
  const svg = [
    `<svg xmlns='http://www.w3.org/2000/svg'>`,
    `<filter id='o' x='-10%' y='-10%' width='120%' height='120%' color-interpolation-filters='sRGB'>`,
    `<feMorphology in='SourceAlpha' operator='dilate' radius='${s} 0' result='h'/>`,
    `<feMorphology in='SourceAlpha' operator='dilate' radius='0 ${s}' result='v'/>`,
    `<feMerge result='d'><feMergeNode in='h'/><feMergeNode in='v'/></feMerge>`,
    `<feFlood flood-color='black' result='c'/>`,
    `<feComposite in='c' in2='d' operator='in' result='outline'/>`,
    `<feMerge><feMergeNode in='outline'/><feMergeNode in='SourceGraphic'/></feMerge>`,
    `</filter></svg>`,
  ].join('');
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}#o")`;
};

export { outlineFilter };

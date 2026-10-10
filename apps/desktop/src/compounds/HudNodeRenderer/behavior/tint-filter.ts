/* @layer renderer-hud @kind logic */
const tintFilter = (color: string, mode: 'multiply' | 'replace', amount: number): string => {
  const a = Math.min(1, Math.max(0, amount));
  const tinted = mode === 'replace'
    ? `<feFlood flood-color='${color}' result='flood'/>
       <feComposite in='flood' in2='SourceAlpha' operator='in' result='tinted'/>`
    : `<feFlood flood-color='${color}' result='flood'/>
       <feBlend in='SourceGraphic' in2='flood' mode='multiply' result='blended'/>
       <feComposite in='blended' in2='SourceAlpha' operator='in' result='tinted'/>`;
  const svg = [
    "<svg xmlns='http://www.w3.org/2000/svg'>",
    "<filter id='t' color-interpolation-filters='sRGB'>",
    tinted,
    `<feComponentTransfer in='SourceGraphic' result='src'><feFuncA type='linear' slope='${1 - a}'/></feComponentTransfer>`,
    `<feComponentTransfer in='tinted' result='tint'><feFuncA type='linear' slope='${a}'/></feComponentTransfer>`,
    "<feMerge><feMergeNode in='src'/><feMergeNode in='tint'/></feMerge>",
    '</filter></svg>',
  ].join('');
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}#t")`;
};

export { tintFilter };

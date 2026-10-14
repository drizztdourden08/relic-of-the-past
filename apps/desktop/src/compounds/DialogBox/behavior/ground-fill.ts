/* @layer renderer-hud @kind logic */
const groundFill = (color: string, opacity: number): string =>
  `color-mix(in srgb, ${color} ${Math.round(opacity * 100)}%, transparent)`;

export { groundFill };

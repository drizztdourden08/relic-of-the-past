/* @layer tests @kind helper */
const inSection = (title: string, selector: string): string =>
  `.hud-subsec[aria-label="${title}"] ${selector}`;

export { inSection };

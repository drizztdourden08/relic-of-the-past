/* @layer sanctuary-site @kind logic */
const clickLink = (href: string, name?: string) => {
  const anchor = document.createElement('a');
  anchor.href = href;
  anchor.rel = 'noopener';
  if (name) anchor.download = name;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
};

export { clickLink };

/* @layer website-site @kind logic */
const focusHeading = (id: string): void => {
  document.getElementById(`${id}-title`)?.focus({ preventScroll: true });
};

export { focusHeading };
